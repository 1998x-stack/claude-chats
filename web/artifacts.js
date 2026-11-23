/**
 * Artifact, document, and file extraction.
 *
 * The export does not carry artifacts as artifacts. Only two rendered pages came
 * with it (`data/artifacts/<container-id>/page.md`); everything else exists only as
 * tool-call payloads inside the conversations, so it has to be reassembled:
 *
 *   `artifacts` tool      create/rewrite carry the whole body, update carries an
 *                         old_str/new_str delta that has to be applied in order
 *   `mcp__Claude_Docs__*` batch creates a document skeleton, update carries a JSON
 *                         payload of block-replace ops whose inline content is the
 *                         prose; concatenated in order it reproduces the document
 *   create_file / Write   full file body per write; later str_replace / Edit calls
 *                         are deltas on top
 *
 * This module is imported by both `tools/build.mjs` (to index every artifact without
 * loading it) and the browser (to rebuild one conversation's bodies on demand), so
 * there is a single implementation of the reassembly rules.
 *
 * Verified: for the 3DGS research document, which also came out as a rendered page,
 * this reconstruction produces the same 29 headings as the exported page.md.
 */

const WRITE_TOOLS = {
  create_file: { path: 'path', body: 'file_text' },
  Write: { path: 'file_path', body: 'content' },
  'Filesystem:write_file': { path: 'path', body: 'content' },
};

const EDIT_TOOLS = {
  str_replace: { path: 'path', old: 'old_str', neu: 'new_str' },
  Edit: { path: 'file_path', old: 'old_string', neu: 'new_string' },
  'Filesystem:edit_file': { path: 'path', old: 'oldText', neu: 'newText' },
};

const EXT_LANG = {
  py: 'python', ipynb: 'python', js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  jsx: 'javascript', ts: 'typescript', tsx: 'typescript', html: 'html', htm: 'html',
  css: 'css', scss: 'css', json: 'json', jsonl: 'json', md: 'markdown', markdown: 'markdown',
  sh: 'bash', bash: 'bash', zsh: 'bash', yml: 'yaml', yaml: 'yaml', sql: 'sql',
  cypher: 'sql', java: 'java', xml: 'html', svg: 'html', txt: null, csv: null,
};

export const ext = (p) => {
  const m = /\.([a-z0-9]+)$/i.exec(String(p || '').split('/').pop() || '');
  return m ? m[1].toLowerCase() : '';
};

export const langForPath = (p) => EXT_LANG[ext(p)] ?? null;

export const baseName = (p) => String(p || '').split('/').pop() || String(p || '');

/** Guess a language for an artifact body that has no filename to go on. */
function sniffLang(content, hint = '') {
  const byHint = langForPath(hint);
  if (byHint) return byHint;
  const s = content || '';
  if (/<!doctype html|<html[\s>]/i.test(s)) return 'html';
  if (/^\s*(?:import|from)\s+\w|^\s*def\s+\w+\s*\(|^\s*class\s+\w+.*:/m.test(s)) return 'python';
  if (/\b(?:function|const|let)\s+\w+\s*[=(]|=>\s*{|^\s*import\s+.*from\s+['"]/m.test(s)) return 'javascript';
  if (/^\s*[{[]\s*"/m.test(s)) return 'json';
  if (/^\s*(?:select|insert|create table|match\s*\()/im.test(s)) return 'sql';
  if (/^\s*(?:public|private)\s+(?:class|static)/m.test(s)) return 'java';
  if (/^\s*(?:-\s+\w+:|\w+:\s*$)/m.test(s)) return 'yaml';
  return null;
}

const typeKind = (t) => {
  if (!t) return null;
  if (t.includes('html')) return 'html';
  if (t.includes('markdown')) return 'markdown';
  if (t.includes('code')) return 'code';
  if (t.includes('text/plain')) return 'text';
  return null;
};

const RE_INLINE_ARTIFACT = /<antArtifact\b([^>]*)>([\s\S]*?)(?:<\/antArtifact>|$)/g;

/**
 * Artifacts written inline in a message body as `<antArtifact …>body</antArtifact>`.
 * This is the older protocol: the body is plain text in the message, never a tool call,
 * so nothing else in this module would find it. 118 of them in this export (~22k lines),
 * none of which overlap the 259 tool-call artifacts.
 * @param {string} text
 * @returns {Array} records shaped like the other artifact records
 */
export function parseInlineArtifacts(text) {
  const out = [];
  for (const m of String(text || '').matchAll(RE_INLINE_ARTIFACT)) {
    const attr = {};
    for (const a of m[1].matchAll(/([\w:-]+)="([^"]*)"/g)) attr[a[1].toLowerCase()] = a[2];
    const body = m[2].replace(/^\n/, '').replace(/\s+$/, '');
    const type = attr.type || '';
    const id = attr.identifier || attr.title || `inline-${out.length + 1}`;
    const kind = typeKind(type);
    out.push({
      key: `art:${id}`,
      kind: 'artifact',
      id,
      title: attr.title || id,
      type: type || null,
      format: kind === 'markdown' ? 'markdown' : kind === 'html' ? 'html' : 'code',
      lang: (attr.language || '').toLowerCase() || null,
      body,
      bytes: body.length,
      msgs: [],
      revisions: 1,
      inline: true,
      // a handful of these are missing their closing tag in the export
      partial: !m[0].endsWith('</antArtifact>'),
    });
  }
  return out;
}

/**
 * One attachment as a panel record. Shared so the build's index and the browser's
 * transcript agree on the key (`att:<message uuid>:<position>`) and the format.
 * @param {string} msgId
 * @param {number} index
 * @param {{name?:string,text?:string,size?:number}} a
 */
export function attachmentRecord(msgId, index, a) {
  // 382 of the 491 attachments in this export lost their filename; only the
  // extension survives, so label them honestly rather than as "attachment".
  const name = a.name || `未命名附件${a.type ? `.${a.type}` : ''}`;
  const body = a.text || '';
  const e = ext(name);
  const isMd = e === 'md' || e === 'markdown';
  const lang = isMd ? null : langForPath(name);
  return {
    key: `att:${msgId}:${index}`,
    kind: 'attachment',
    id: `att:${msgId}:${index}`,
    title: name,
    path: name,
    body,
    bytes: body.length || a.size || 0,
    msgs: [],
    format: isMd ? 'markdown' : e === 'html' ? 'html' : lang ? 'code' : 'text',
    lang,
    shared: true,
    partial: false,
    revisions: 0,
  };
}

/**
 * Walks one conversation and returns the artifacts, documents, and files it produced.
 * @param {object} chat normalized chat ({ id, name, messages })
 * @param {Map<string,{title?:string,markdown:string,source?:string}>} [pages]
 *        exported rendered pages keyed by Claude Docs container id; when one matches
 *        it is used as the authoritative body instead of a reconstruction
 * @returns {{docs: Array, files: Array, unresolved: number}}
 */
export function collectArtifacts(chat, pagesIn = null) {
  // tolerate a plain object as well as the Map the build passes in
  const pages = pagesIn instanceof Map ? pagesIn
    : pagesIn && typeof pagesIn === 'object' ? new Map(Object.entries(pagesIn)) : null;
  const arts = new Map();     // artifact id -> record
  const inline = new Map();   // artifact written inline in a message body
  const docs = new Map();     // container id (or conv:<id>) -> record
  const files = new Map();    // path -> record
  let unresolved = 0;

  const msgs = chat.messages || [];
  const touch = (rec, mi) => { if (!rec.msgs.includes(mi)) rec.msgs.push(mi); };
  for (let mi = 0; mi < msgs.length; mi++) {
    const msg = msgs[mi];
    for (const b of msg.blocks || []) {
      // ---- artifacts written inline in the message text ---------------------
      if (b.k === 'text' && b.md && b.md.includes('<antArtifact')) {
        for (const rec of parseInlineArtifacts(b.md)) {
          const prev = inline.get(rec.key);
          if (prev) { touch(prev, mi); prev.revisions++; } else { touch(rec, mi); inline.set(rec.key, rec); }
        }
      }
      if (b.k !== 'tool') continue;
      const name = b.name || '';
      const input = b.input && typeof b.input === 'object' ? b.input : {};

      // ---- Claude artifacts -------------------------------------------------
      if (name === 'artifacts') {
        const id = String(input.id || input.title || `artifact-${arts.size + 1}`);
        const rec = arts.get(id) || {
          key: `art:${id}`, kind: 'artifact', id, title: '', type: null,
          body: '', format: 'code', msgs: [], revisions: 0, partial: false,
        };
        const kind = typeKind(input.type);
        if (kind) { rec.format = kind === 'markdown' ? 'markdown' : kind === 'html' ? 'html' : 'code'; rec.type = input.type; }
        if (input.title) rec.title = rec.title || input.title;
        const cmd = input.command || 'create';
        if (typeof input.content === 'string' && (cmd === 'create' || cmd === 'rewrite' || !rec.body)) {
          rec.body = input.content;
        } else if (cmd === 'update' || cmd === 'str_replace') {
          if (typeof input.new_str === 'string') {
            if (input.old_str && rec.body.includes(input.old_str)) rec.body = rec.body.replace(input.old_str, input.new_str);
            else { rec.body += `\n${input.new_str}`; rec.partial = true; unresolved++; }
          }
        }
        rec.revisions++;
        touch(rec, mi);
        arts.set(id, rec);
        continue;
      }

      // ---- Claude Docs pages ------------------------------------------------
      if (name.startsWith('mcp__Claude_Docs__')) {
        const containerId = input.container?.id || null;
        const cid = containerId || `conv:${chat.id}`;
        const rec = docs.get(cid) || {
          key: `doc:${cid}`, kind: 'doc', id: cid, containerId, title: '', body: '',
          format: 'markdown', msgs: [], ops: 0, comments: [], partial: false,
          engine: input.engine || null,
        };
        rec.containerId = rec.containerId || containerId;
        touch(rec, mi);
        if (input.container?.create?.name) rec.title = rec.title || input.container.create.name;
        const skel = input.container?.create?.doc;
        if (skel?.markdown) rec.skeleton = skel.markdown;
        if (typeof input.payload === 'string') {
          try {
            const pl = JSON.parse(input.payload);
            if (pl.value?.body) rec.comments.push({ body: pl.value.body, at: mi });
            for (const op of pl.ops || []) {
              rec.ops++;
              const src = op.with?.from || op.with?.to || {};
              if (typeof src.content === 'string' && src.content.trim()) {
                rec.parts = rec.parts || [];
                rec.parts.push(src.content);
              }
            }
          } catch { rec.partial = true; }
        }
        docs.set(cid, rec);
        continue;
      }

      // ---- files written by Claude Code ------------------------------------
      const w = WRITE_TOOLS[name];
      if (w) {
        const p = input[w.path];
        if (!p) continue;
        const rec = files.get(p) || {
          key: `file:${p}`, kind: 'file', id: p, title: baseName(p), path: p,
          body: '', format: 'code', msgs: [], shared: false, partial: false,
        };
        if (typeof input[w.body] === 'string') rec.body = input[w.body];
        touch(rec, mi);
        files.set(p, rec);
        continue;
      }
      const e = EDIT_TOOLS[name];
      if (e && input[e.path]) {
        const rec = files.get(input[e.path]);
        if (!rec) { unresolved++; continue; }   // edited a file the export never wrote
        const oldS = input[e.old], newS = input[e.neu];
        if (rec.body && typeof oldS === 'string' && typeof newS === 'string') {
          if (rec.body.includes(oldS)) rec.body = rec.body.replace(oldS, newS);
          else { rec.partial = true; unresolved++; }
        }
        touch(rec, mi);
        continue;
      }
      // ---- files handed to the user ----------------------------------------
      if (name === 'present_files') {
        for (const p of input.filepaths || input.paths || []) {
          const rec = files.get(p) || {
            key: `file:${p}`, kind: 'file', id: p, title: baseName(p), path: p,
            body: '', format: 'code', msgs: [], shared: false, partial: false,
          };
          rec.shared = true;
          touch(rec, mi);
          files.set(p, rec);
        }
      }
    }
  }

  const finish = (rec) => {
    rec.bytes = (rec.body || '').length;
    rec.lang = rec.format === 'markdown' ? null
      : rec.format === 'html' ? 'html'
        : sniffLang(rec.body, rec.path || rec.title);
    if (rec.format === 'code' && rec.lang === 'markdown') rec.format = 'markdown';
    if (!rec.title) rec.title = rec.path || rec.id;
    delete rec.skeleton;
    delete rec.parts;
    return rec;
  };

  // A conversation's Docs activity can arrive without a container id on the opening
  // call (batch/create) and with one afterwards (update/read). Those end up as two
  // records; fold the placeholder into the real one.
  const placeholderKeys = [...docs.keys()].filter((k) => k.startsWith('conv:'));
  const realKeys = [...docs.keys()].filter((k) => !k.startsWith('conv:'));
  if (placeholderKeys.length && realKeys.length) {
    const target = docs.get(realKeys[0]);
    for (const k of placeholderKeys) {
      const rec = docs.get(k);
      target.title = target.title || rec.title;
      target.skeleton = target.skeleton || rec.skeleton;
      target.parts = [...(rec.parts || []), ...(target.parts || [])];
      target.comments = [...rec.comments, ...target.comments];
      target.partial = target.partial || rec.partial;
      for (const m of rec.msgs) touch(target, m);
      docs.delete(k);
    }
  }
  const docList = [...docs.values()].map((d) => {
    const page = d.containerId && pages?.get(d.containerId);
    if (page?.markdown) {
      d.body = page.markdown;
      d.title = page.title || d.title;
      d.authoritative = true;
    } else if (d.parts?.length) {
      d.body = d.parts.join('\n\n');
    } else if (d.skeleton) {
      d.body = d.skeleton;
    } else {
      d.partial = true;
    }
    return finish(d);
  });
  const artList = [...arts.values()].map(finish);
  // Inline artifacts fill in artifacts that never went through the artifact tool.
  // Anything the tool already produced wins: it is the more complete body.
  const inlineList = [...inline.values()]
    .filter((rec) => !arts.has(rec.id))
    .map((rec) => finish(rec));
  const fileList = [...files.values()].map(finish);

  return { docs: [...docList, ...artList, ...inlineList], files: fileList, unresolved };
}

/** A one-line summary of what a tool run produced, for the transcript. */
export function summarizeArtifact(rec) {
  const kb = rec.bytes ? `${(rec.bytes / 1024).toFixed(1)} KB` : '';
  const what = rec.kind === 'doc' ? '文档' : rec.kind === 'artifact'
    ? (rec.format === 'markdown' ? '文档' : rec.format === 'html' ? '网页' : '代码')
    : '文件';
  return [what, kb].filter(Boolean).join(' · ');
}
