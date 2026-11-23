/**
 * Preprocesses the raw claude.ai export into something a browser can load.
 *
 *   data/conversations.json  (238 MB, one giant array)
 *     -> web/data/index.json          chat list metadata, ~700 records
 *     -> web/data/chats/<uuid>.json   one normalized chat each, lazy loaded
 *     -> web/data/corpus.json         flat lowercase search corpus, lazy loaded
 *
 * Reads the array one conversation at a time (via `jq -c '.[]'` when available, so
 * the 238 MB never lands in one string), so it runs in a normal heap.
 * Usage: node tools/build.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectArtifacts, attachmentRecord } from '../web/artifacts.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'data', 'conversations.json');
const OUT = path.join(ROOT, 'web', 'data');
const CHATS = path.join(OUT, 'chats');
const EXPORTED_PAGES = path.join(ROOT, 'data', 'artifacts');

/**
 * The export ships a handful of fully rendered artifact pages. They are the only
 * authoritative copy of those documents — everything else has to be rebuilt from
 * tool-call payloads — so load them and key them by Claude Docs container id.
 */
/**
 * Exported pages open with a duplicate H1 and a `<!-- tab: Tab 1 -->` marker. The
 * marker is structural, not content, and would otherwise render as a stray paragraph.
 */
function cleanPage(md) {
  const lines = String(md)
    .replace(/^[ \t]*<!--\s*tab:.*?-->[ \t]*$/gm, '')
    .split('\n');
  const heads = [];
  for (let i = 0; i < lines.length && i < 14; i++) {
    const m = /^#\s+(.+?)\s*$/.exec(lines[i]);
    if (m) heads.push({ i, text: m[1] });
    if (heads.length === 2) break;
  }
  if (heads.length === 2 && heads[0].text === heads[1].text) lines.splice(heads[1].i, 1);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function loadExportedPages() {
  const pages = new Map();
  if (!fs.existsSync(EXPORTED_PAGES)) return pages;
  for (const entry of fs.readdirSync(EXPORTED_PAGES)) {
    const dir = path.join(EXPORTED_PAGES, entry);
    if (!fs.statSync(dir).isDirectory()) continue;
    try {
      const meta = JSON.parse(fs.readFileSync(path.join(dir, 'artifact.json'), 'utf8'));
      const markdown = fs.readFileSync(path.join(dir, 'page.md'), 'utf8');
      let comments = [];
      try { comments = JSON.parse(fs.readFileSync(path.join(dir, 'comments.json'), 'utf8')); } catch { /* none */ }
      const title = meta.versions?.[0]?.title || meta.id;
      pages.set(meta.id, { id: meta.id, title, markdown: cleanPage(markdown), comments, updated: meta.updated_at });
    } catch (e) {
      console.warn(`  skipped exported page ${entry}: ${e.message}`);
    }
  }
  return pages;
}

/** Per-source character caps for the search corpus. Nothing is capped in the chat files. */
const CORPUS_CAP = { toolInput: 2_000, toolResult: 40_000, attachment: 40_000 };

/**
 * The bits of a tool call worth indexing in full before its body is truncated:
 * a file path or a search query is what people actually remember.
 */
const HINT_KEYS = ['path', 'file_path', 'command', 'query', 'url', 'title', 'pattern', 'name', 'id', 'description'];

function toolHint(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return '';
  return HINT_KEYS
    .map((k) => (typeof input[k] === 'string' ? input[k] : ''))
    .filter(Boolean)
    .join(' ');
}

// ---------------------------------------------------------------------------
// reading the export, one conversation at a time
// ---------------------------------------------------------------------------

/**
 * Yields each conversation without holding the whole 238 MB document.
 *
 * Preferred path: let `jq -c '.[]'` do the parsing and consume one compact JSON
 * object per line off its stdout. A hand-rolled brace scanner was tried first and
 * silently truncated 20 of the 705 objects, so this uses a real parser.
 * Fallback: JSON.parse the whole file on a heap large enough for it.
 */
async function* conversations(file) {
  if (await hasJq()) {
    const jq = spawn('jq', ['-c', '.[]', file], { stdio: ['ignore', 'pipe', 'inherit'] });
    jq.stdout.setEncoding('utf8');
    // Split on \n manually rather than using readline: the export contains U+2028
    // LINE SEPARATOR inside pasted web content, and readline treats that as a line
    // break, which silently chopped 5 conversations into 8 pieces.
    let carry = '';
    for await (const chunk of jq.stdout) {
      carry += chunk;
      let nl;
      while ((nl = carry.indexOf('\n')) >= 0) {
        const line = carry.slice(0, nl);
        carry = carry.slice(nl + 1);
        if (line.trim()) yield parseConversation(line);
      }
    }
    if (carry.trim()) yield parseConversation(carry);
    const code = await new Promise((res) => jq.on('close', res));
    if (code !== 0) throw new Error(`jq exited ${code}`);
    return;
  }

  const heapGb = Math.round((Number(process.execArgv.find((a) => a.startsWith('--max-old-space-size='))?.split('=')[1]) || 4));
  if (heapGb < 8 && !process.env.PI_BUILD_CHILD) {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, ['--max-old-space-size=8192', ...process.argv.slice(1)], {
      stdio: 'inherit', env: { ...process.env, PI_BUILD_CHILD: '1' },
    });
    process.exit(r.status ?? 1);
  }
  console.warn('jq not found; falling back to JSON.parse (needs ~2 GB of heap)');
  for (const c of JSON.parse(fs.readFileSync(file, 'utf8'))) yield c;
}

function parseConversation(text) {
  const c = JSON.parse(text);
  // A truncated or mis-split record would otherwise sail through and quietly
  // produce a short chat, so refuse anything that isn't shaped like one.
  if (!c || typeof c !== 'object' || !Array.isArray(c.chat_messages)) {
    throw new Error(`not a conversation record (keys: ${Object.keys(c || {}).join(',')})`);
  }
  return c;
}

let jqAvailable = null;
async function hasJq() {
  if (jqAvailable !== null) return jqAvailable;
  jqAvailable = await new Promise((res) => {
    const p = spawn('jq', ['--version'], { stdio: 'ignore' });
    p.on('error', () => res(false));
    p.on('close', (code) => res(code === 0));
  });
  return jqAvailable;
}

// ---------------------------------------------------------------------------
// normalization
// ---------------------------------------------------------------------------

const TOOL_GROUPS = [
  [/(^|[_:])read_file$|^read$|^view$|^Filesystem:read|^Read$/i, 'read', '读取了 %n 个文件'],
  [/(^|[_:])write_file$|^create_file$|^Write$|^Filesystem:write/i, 'write', '创建了 %n 个文件'],
  [/^str_replace$|^edit_file$|^Edit$|^Filesystem:edit/i, 'edit', '编辑了 %n 个文件'],
  [/^bash_tool$|^bash$|^Bash$/i, 'bash', '执行了 %n 条命令'],
  [/^web_search$|^WebSearch$/i, 'search', '搜索了 %n 次网络'],
  [/^web_fetch$|^WebFetch$/i, 'fetch', '抓取了 %n 个网页'],
  [/^artifacts?$|^Artifact$/i, 'artifact', '创建了 %n 个工件'],
  [/^present_files$|^SendUserFile$/i, 'present', '分享了 %n 个文件'],
  [/^Task(Create|Update)$/i, 'task', '更新了任务列表'],
  [/^visualize:/i, 'viz', '渲染了 %n 个可视化'],
  [/^Skill$/i, 'skill', '调用了技能'],
  [/^Projects?$|recent_chats|conversation_search/i, 'recall', '检索了历史对话'],
  [/^ask_user_input/i, 'ask', '向你提问'],
  [/^(mcp__|Context7|Claude_Docs|memory|Filesystem)/i, 'mcp', '调用了 %n 次外部工具'],
];

function classifyTool(name) {
  const n = name || '';
  for (const [re, kind, label] of TOOL_GROUPS) if (re.test(n)) return { kind, label };
  return { kind: 'other', label: '调用了 %n 个工具' };
}

const cap = (s, n) => (s && s.length > n ? s.slice(0, n) : s || '');

/** The account holder, so the sidebar footer can show a real name. Never the email. */
function loadUser() {
  const file = path.join(ROOT, 'data', 'users.json');
  try {
    const [u] = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { name: u?.full_name || '本地', uuid: u?.uuid || null };
  } catch {
    return { name: '本地', uuid: null };
  }
}

/**
 * Pasted web content carries U+2028/U+2029 as visual line breaks. They are valid
 * JSON but render as nothing, so turn them into real newlines.
 */
const unsep = (s) => (typeof s === 'string' ? s.replace(/[\u2028\u2029]/g, '\n') : s);

/** Collapse whitespace, drop fenced code, for list previews. */
function oneLiner(s, n = 60) {
  let t = (s || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/[*_>#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length > n) {
    const cut = t.slice(0, n);
    const sp = cut.lastIndexOf(' ');
    t = (sp > n * 0.6 ? cut.slice(0, sp) : cut).trim() + '…';
  }
  return t;
}

const isToolResultOnly = (blocks) =>
  blocks.length > 0 && blocks.every((b) => b.type === 'tool_result' || b.type === 'token_budget');

function normalizeMessage(m) {
  const raw = Array.isArray(m.content) ? m.content : [];
  const blocks = [];
  const attachments = [];
  const toolResults = [];

  for (const b of raw) {
    if (!b || typeof b !== 'object') continue;
    switch (b.type) {
      case 'text':
        if (b.text && b.text.trim()) blocks.push({ k: 'text', md: unsep(b.text) });
        break;
      case 'thinking': {
        const dur = b.start_timestamp && b.stop_timestamp
          ? Math.max(0, new Date(b.stop_timestamp) - new Date(b.start_timestamp)) : 0;
        if (b.thinking && b.thinking.trim()) blocks.push({ k: 'thinking', md: unsep(b.thinking), ms: dur || 0 });
        break;
      }
      case 'tool_use': {
        const { kind, label } = classifyTool(b.name);
        blocks.push({ k: 'tool', name: b.name || 'tool', kind, label, input: b.input ?? null });
        break;
      }
      case 'tool_result':
        toolResults.push({
          name: b.name || '',
          isError: !!b.is_error,
          hidden: !!b.hidden_in_chat,
          parts: (b.content || [])
            .map((x) => (x && x.type === 'text' ? { t: 'text', text: unsep(x.text || '') } : null))
            .filter(Boolean),
          extra: (b.content || [])
            .filter((x) => x && x.type !== 'text')
            .map((x) => ({ t: x.type, title: x.title, url: x.url, file_path: x.file_path, name: x.name }))
            .slice(0, 40),
        });
        break;
      case 'injected_prompt_block':
        if (b.prompt && b.prompt.trim()) blocks.push({ k: 'injected', md: unsep(b.prompt), source: b.injection_source || '' });
        break;
      default:
        break;
    }
  }

  // `text` mirrors the blocks; only use it when content[] gave us nothing useful.
  if (!blocks.length && !toolResults.length && m.text && m.text.trim()) {
    blocks.push({ k: 'text', md: unsep(m.text) });
  }

  for (const a of m.attachments || []) {
    attachments.push({
      // left empty when the export lost the filename; attachmentRecord() names it
      name: a.file_name || '',
      size: a.file_size ?? 0,
      type: a.file_type || '',
      text: unsep(a.extracted_content || ''),
    });
  }

  return {
    id: m.uuid,
    sender: m.sender,
    ts: m.created_at || null,
    blocks,
    attachments,
    toolResults,
    toolResultOnly: isToolResultOnly(raw),
    files: (m.files || []).map((f) => f.file_name).filter(Boolean),
    parent: m.parent_message_uuid || null,
  };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`missing ${SRC}\nrun: unzip -o assets/conversations-000.zip -d data`);
    process.exit(1);
  }
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(CHATS, { recursive: true });

  const index = [];
  const corpus = [];
  const artifactIndex = [];
  const attachmentsIndex = [];
  const pages = loadExportedPages();
  const stats = {
    conversations: 0, messages: 0, humans: 0, assistants: 0,
    chars: 0, thinking: 0, attachments: 0, attachmentsTruncated: 0,
    toolCalls: 0, toolResults: 0, toolErrors: 0, unnamed: 0, withSummary: 0,
    firstDate: null, lastDate: null, toolKinds: {}, sources: {},
    docs: 0, files: 0, sharedFiles: 0, artifactBytes: 0, artifactPartial: 0, unresolvedEdits: 0,
    attachmentBytes: 0,
    authoritativeDocs: 0, convsWithOutput: 0,
  };

  for await (const c of conversations(SRC)) {
    const msgs = (c.chat_messages || []).map(normalizeMessage);

    // attach tool results to the tool calls that produced them, in order
    const pending = [];
    for (const m of msgs) {
      for (const b of m.blocks) if (b.k === 'tool') pending.push(b);
      for (const r of m.toolResults) {
        let owner = null;
        for (let i = 0; i < pending.length; i++) {
          if (pending[i].result === undefined && (!r.name || pending[i].name === r.name)) { owner = pending[i]; break; }
        }
        if (!owner) { owner = pending.find((p) => p.result === undefined) || null; }
        if (owner) owner.result = r;
        r.matched = !!owner;
      }
      // tool results that never found a call stay visible, not silently dropped
      m.toolResults = m.toolResults.filter((r) => !r.matched);
    }

    let chars = 0;
    let humanChars = 0;
    let thinkingChars = 0;
    let toolErrors = 0;
    let toolCalls = 0;
    const kinds = {};
    let firstHuman = '';

    for (const m of msgs) {
      stats.messages++;
      if (m.sender === 'human') { stats.humans++; } else { stats.assistants++; }
      for (const b of m.blocks) {
        if (b.k === 'text') {
          chars += b.md.length;
          if (m.sender === 'human') {
            humanChars += b.md.length;
            if (!firstHuman) firstHuman = b.md;
          }
        } else if (b.k === 'thinking') {
          thinkingChars += b.md.length;
        } else if (b.k === 'tool') {
          toolCalls++;
          kinds[b.kind] = (kinds[b.kind] || 0) + 1;
          if (b.result && b.result.isError) toolErrors++;
        }
      }
      for (const a of m.attachments) stats.attachments++;
    }

    // search corpus: everything a person might remember seeing, lowercased
    const parts = [c.name || ''];
    let attachTruncated = 0;
    for (const m of msgs) {
      for (const b of m.blocks) {
        if (b.k === 'text' || b.k === 'thinking') parts.push(b.md);
        else if (b.k === 'tool') {
          if (b.input) {
            try {
              const hint = toolHint(b.input);
              const body = cap(JSON.stringify(b.input), CORPUS_CAP.toolInput);
              parts.push(hint ? `${hint}\n${body}` : body);
            } catch { /* ignore */ }
          }
          if (b.result) for (const p of b.result.parts) parts.push(cap(p.text, CORPUS_CAP.toolResult));
        }
      }
      for (const a of m.attachments) {
        if (a.text.length > CORPUS_CAP.attachment) attachTruncated++;
        parts.push(cap(a.text, CORPUS_CAP.attachment));
      }
    }
    stats.attachmentsTruncated += attachTruncated;

    const displayName = c.name?.trim() || oneLiner(firstHuman, 48) || '未命名对话';
    const id = c.uuid;
    const chatFile = {
      id,
      name: c.name || '',
      displayName,
      summary: c.summary || '',
      created: c.created_at,
      updated: c.updated_at,
      messages: msgs,
    };

    const json = JSON.stringify(chatFile);
    fs.writeFileSync(path.join(CHATS, `${id}.json`), json);

    // ---- artifacts, documents, and files this conversation produced ----------
    const { docs, files, unresolved } = collectArtifacts(chatFile, pages);
    stats.unresolvedEdits += unresolved;
    // Attachments are indexed alongside artifacts so they show up in 全部产物 too;
    // their bodies already live in the chat file, so only metadata goes in the index.
    msgs.forEach((m, mi) => {
      (m.attachments || []).forEach((a, ai) => {
        const rec = attachmentRecord(m.id, ai, a);
        // metadata only: the body already lives in the chat file. A short snippet is
        // kept so unnamed pastes can still be told apart in the list.
        const { body, ...meta } = rec;
        attachmentsIndex.push({
          ...meta,
          snippet: oneLiner(body, 110),
          msgs: [mi], conv: id, convName: displayName, convUpdated: c.updated_at,
        });
        stats.attachmentBytes += rec.bytes;
      });
    });
    if (docs.length || files.length) stats.convsWithOutput++;
    for (const rec of [...docs, ...files]) {
      artifactIndex.push({
        key: rec.key,
        conv: id,
        convName: displayName,
        convUpdated: c.updated_at,
        kind: rec.kind,
        title: rec.title,
        path: rec.path || null,
        format: rec.format,
        lang: rec.lang || null,
        bytes: rec.bytes,
        msgs: rec.msgs,
        shared: !!rec.shared,
        partial: !!rec.partial,
        revisions: rec.revisions || 0,
        authoritative: !!rec.authoritative,
        comments: rec.comments?.length || 0,
      });
      stats.artifactBytes += rec.bytes;
      if (rec.partial) stats.artifactPartial++;
      if (rec.kind === 'file') { stats.files++; if (rec.shared) stats.sharedFiles++; }
      else { stats.docs++; if (rec.authoritative) stats.authoritativeDocs++; }
    }

    index.push({
      id,
      name: displayName,
      named: !!c.name?.trim(),
      summary: oneLiner(c.summary, 160),
      preview: oneLiner(firstHuman, 170),
      created: c.created_at,
      updated: c.updated_at,
      messages: msgs.length,
      turns: msgs.filter((m) => m.sender === 'human' && m.blocks.some((b) => b.k === 'text')).length,
      chars,
      humanChars,
      thinkingChars,
      hasThinking: thinkingChars > 0,
      attachments: msgs.reduce((n, m) => n + m.attachments.length, 0),
      toolCalls,
      toolErrors,
      kinds,
      bytes: json.length,
    });

    corpus.push([id, parts.join('\n').toLowerCase()]);

    stats.conversations++;
    stats.chars += chars;
    stats.thinking += thinkingChars;
    stats.toolCalls += toolCalls;
    stats.toolErrors += toolErrors;
    stats.unnamed += c.name?.trim() ? 0 : 1;
    stats.withSummary += c.summary ? 1 : 0;
    for (const [k, v] of Object.entries(kinds)) stats.toolKinds[k] = (stats.toolKinds[k] || 0) + v;
    if (c.created_at) {
      if (!stats.firstDate || c.created_at < stats.firstDate) stats.firstDate = c.created_at;
      if (!stats.lastDate || c.created_at > stats.lastDate) stats.lastDate = c.created_at;
    }
  }

  index.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));

  // Search runs in the server, which loads this once and lowercases it in memory,
  // so there is no gzipped copy to ship to the browser.
  const corpusJson = JSON.stringify(corpus);
  fs.writeFileSync(path.join(OUT, 'corpus.json'), corpusJson);

  // Metadata only: bodies are rebuilt in the browser from the chat file that owns
  // them, so nothing is stored twice.
  fs.writeFileSync(
    path.join(OUT, 'artifacts.json'),
    JSON.stringify({ builtAt: new Date().toISOString(), stats: {
      docs: stats.docs, files: stats.files, sharedFiles: stats.sharedFiles,
      bytes: stats.artifactBytes + stats.attachmentBytes, partial: stats.artifactPartial,
      conversations: stats.convsWithOutput, attachments: attachmentsIndex.length,
    }, items: [...artifactIndex, ...attachmentsIndex] })
  );
  fs.writeFileSync(
    path.join(OUT, 'pages.json'),
    JSON.stringify(Object.fromEntries(pages))
  );

  fs.writeFileSync(
    path.join(OUT, 'index.json'),
    JSON.stringify({ builtAt: new Date().toISOString(), stats, user: loadUser(), chats: index })
  );

  const mb = (n) => (n / 1048576).toFixed(1) + ' MB';
  console.log(`conversations  ${stats.conversations}  (${stats.unnamed} unnamed, ${stats.withSummary} with summary)`);
  console.log(`messages       ${stats.messages}  (${stats.humans} human / ${stats.assistants} assistant)`);
  console.log(`text           ${mb(stats.chars)} in messages, ${mb(stats.thinking)} of thinking`);
  console.log(`tools          ${stats.toolCalls} calls, ${stats.toolErrors} errors`);
  console.log(`tool kinds     ${Object.entries(stats.toolKinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  console.log(`attachments    ${stats.attachments} (${stats.attachmentsTruncated} truncated in corpus)`);
  console.log(`range          ${stats.firstDate?.slice(0, 10)} → ${stats.lastDate?.slice(0, 10)}`);
  console.log(`corpus         ${mb(corpusJson.length)}`);
  console.log(`artifacts      ${stats.docs} documents + ${stats.files} files (${stats.sharedFiles} shared)`);
  console.log(`               ${mb(stats.artifactBytes)} of content, ${stats.authoritativeDocs} rendered pages from the export, ${stats.artifactPartial} rebuilds incomplete`);
  console.log(`chats dir      ${mb(fs.readdirSync(CHATS).reduce((n, f) => n + fs.statSync(path.join(CHATS, f)).size, 0))}`);
  console.log(`-> ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
