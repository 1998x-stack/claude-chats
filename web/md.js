/**
 * Markdown renderer for chat transcripts.
 *
 * Written by hand rather than pulling in a library because the input is an export:
 * it is never re-rendered, it is huge, and it must not execute anything it contains.
 * Everything is HTML-escaped before any formatting runs, and the only URLs that
 * survive linkification are http(s), mailto, and in-page anchors.
 *
 * Covers what this data actually contains (counted across all 705 conversations):
 * fences, tables (4007 rows), headings (7318), nested lists (41337), hr (1531),
 * inline code, bold/italic, task lists, display math. There are no images or
 * footnotes to speak of, so neither is really supported. LaTeX appears ~1000 times
 * in 6.6M chars, which is too rare to justify shipping a math engine.
 */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

const NUL = '\u0000';
const token = (kind, i) => `${NUL}${kind}${i}${NUL}`;
const ANY_TOKEN = /\u0000[A-Za-z]\d+\u0000/;      // never global: `.test` must not keep state
const ALL_TOKENS_G = /\u0000([A-Za-z])(\d+)\u0000/g;

// ---------------------------------------------------------------------------
// code
// ---------------------------------------------------------------------------

const KEYWORDS = {
  python: 'def class return if elif else for while import from as with try except finally raise yield lambda pass break continue global nonlocal assert del not and or in is None True False async await match case self',
  javascript: 'function const let var return if else for while do switch case break continue new class extends super this typeof instanceof in of try catch finally throw async await yield import export default from null undefined true false static get set delete void',
  typescript: 'function const let var return if else for while switch case break continue new class extends implements interface type enum import export default from null undefined true false async await public private readonly static as satisfies keyof typeof',
  java: 'public private protected class interface extends implements return if else for while switch case break continue new static final void int long double float boolean String null true false try catch finally throw throws import package this super',
  bash: 'if then else elif fi for while do done case esac function return exit local export source echo cd set unset trap read eval exec',
  json: 'true false null',
  sql: 'select from where group by order having limit join left right inner outer on as and or not in exists union insert into values update set delete create table index view with distinct count sum avg min max case when then else end',
  yaml: 'true false null yes no on off',
  css: 'important media supports keyframes from to and not',
};

const LANG_ALIAS = {
  py: 'python', python3: 'python', js: 'javascript', jsx: 'javascript', ts: 'typescript',
  tsx: 'typescript', sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash',
  jsonc: 'json', yml: 'yaml', cypher: 'sql', postgres: 'sql', sqlite: 'sql',
  scss: 'css', less: 'css', html: 'html', xml: 'html', svg: 'html', vue: 'html',
};

function normLang(l) {
  const k = (l || '').toLowerCase().trim();
  if (!k) return null;
  const a = LANG_ALIAS[k] || k;
  return a === 'html' || a === 'diff' || KEYWORDS[a] ? a : null;
}

/**
 * Minimal, dependency-free highlighter. Tokenises the *raw* code with one combined
 * regex and escapes every piece on the way out, so nothing in a code block can
 * inject markup. Unknown languages return null and render plain.
 */
export function highlight(code, lang) {
  const L = normLang(lang);
  if (!L) return null;

  if (L === 'diff') {
    return code.split('\n').map((l) => {
      const cls = /^\+/.test(l) ? 'add' : /^-/.test(l) ? 'del' : /^@@/.test(l) ? 'meta' : '';
      return cls ? `<span class="tok-${cls}">${escapeHtml(l)}</span>` : escapeHtml(l);
    }).join('\n');
  }

  const kw = new Set((KEYWORDS[L] || '').split(' '));
  const re = new RegExp(
    [
      '(#[^\\n]*|\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|<!--[\\s\\S]*?-->|--[^\\n]*)',            // 1 comment
      '("""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)', // 2 string
      '(\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b|\\b0[xX][0-9a-fA-F]+\\b)',               // 3 number
      '([A-Za-z_$][\\w$]*)',                                                                  // 4 word
    ].join('|'),
    'g'
  );

  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(code))) {
    out += escapeHtml(code.slice(last, m.index));
    const [full, comment, str, num, word] = m;
    last = re.lastIndex;
    if (comment) out += `<span class="tok-c">${escapeHtml(full)}</span>`;
    else if (str) out += `<span class="tok-s">${escapeHtml(full)}</span>`;
    else if (num) out += `<span class="tok-n">${escapeHtml(full)}</span>`;
    else if (word) {
      if (kw.has(word)) out += `<span class="tok-k">${escapeHtml(word)}</span>`;
      else if (code[last] === '(') out += `<span class="tok-f">${escapeHtml(word)}</span>`;
      else if (L === 'html' && /[<>]/.test(code[m.index - 1] || '')) out += `<span class="tok-t">${escapeHtml(word)}</span>`;
      else out += escapeHtml(word);
    }
  }
  out += escapeHtml(code.slice(last));
  return out;
}

// ---------------------------------------------------------------------------
// inline
// ---------------------------------------------------------------------------

const SAFE_URL = /^(https?:\/\/|mailto:|#|\/)/i;
const TRAILING_PUNCT = /[.,;:!?]+$/;

function inline(text, code) {
  let s = text;

  // Inline code first, so its contents are never formatted or linkified.
  s = s.replace(/(`+)([\s\S]*?)\1/g, (_, _ticks, body) =>
    token('c', code.push(`<code>${escapeHtml(body.replace(/^ | $/g, ''))}</code>`) - 1));

  const link = (url, label) =>
    SAFE_URL.test(url) ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>` : label;

  // Images before links, or the link rule eats the `[alt](url)` half of `![alt](url)`.
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) =>
    SAFE_URL.test(url) ? `<a class="md-img" href="${url}" target="_blank" rel="noopener noreferrer">🖼 ${alt || url}</a>` : m);
  s = s.replace(/\[([^\]]*)\]\(([^)\s]+?)(?:\s+[^)]*)?\)/g, (m, label, url) => link(url, label));

  // Bare URLs. `&` is already `&amp;` here, which is correct inside an href.
  s = s.replace(/(^|[\s(])((?:https?:\/\/|www\.)[^\s<>()]+)/g, (m, pre, url) => {
    const trail = TRAILING_PUNCT.exec(url)?.[0] || '';
    const clean = url.slice(0, url.length - trail.length);
    return pre + link(/^www\./i.test(clean) ? 'https://' + clean : clean, clean) + trail;
  });

  s = s.replace(/\*\*\*([^*\n]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^\w*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  // `_` only emphasises at a boundary, so identifiers like _core/_loop/_llm survive intact.
  s = s.replace(/(^|[\s(])__([^_\n]+)__(?=[\s).,;:!?]|$)/g, '$1<strong>$2</strong>');
  s = s.replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

  return s;
}

// ---------------------------------------------------------------------------
// blocks
// ---------------------------------------------------------------------------

const RE_HEADING = /^(#{1,6})\s+(.*)$/;
const RE_HR = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
const RE_FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([^\s`]*)\s*$/;
const RE_UL = /^(\s*)([-*+])\s+(.*)$/;
const RE_OL = /^(\s*)(\d{1,9})[.)]\s+(.*)$/;
const RE_QUOTE = /^\s{0,3}>\s?(.*)$/;
const RE_TABLE_ROW = /^\s*\|/;
const RE_MATH_OPEN = /^\s*(\$\$|\\\[)\s*(.*)$/;
// `<antArtifact>` is how the model used to emit an artifact inline in a message body.
const RE_ANT_OPEN = /^\s*<antArtifact\b([^>]*)>\s*$/;

const indentOf = (l) => (/^\s*/.exec(l)[0] || '').replace(/\t/g, '  ').length;

/**
 * A GFM delimiter row. Requiring a pipe is what keeps a bare `---` a horizontal
 * rule instead of a one-column table delimiter.
 */
const isSepRow = (l) => typeof l === 'string' && l.includes('|')
  && /^\s*\|?[\s:|-]*-{2,}[\s:|-]*\|?\s*$/.test(l);

const isListLine = (l) => RE_UL.test(l) || RE_OL.test(l);

const isBlockStart = (t) => ANY_TOKEN.test(t) || RE_HEADING.test(t) || RE_HR.test(t)
  || RE_QUOTE.test(t) || RE_MATH_OPEN.test(t) || RE_TABLE_ROW.test(t) || isSepRow(t);

const mathBlock = (body) => `<div class="md-math">${body.trim()}</div>`;

/** A line that is the header of a table — including one written without a leading pipe. */
const isTableHeaderAt = (ls, j) => typeof ls[j] === 'string' && ls[j].includes('|')
  && isSepRow(ls[j + 1] || '');

/**
 * Splits a table row into cells. Respects `` ` ` `` spans and `\|` escapes, so an
 * inline-code span or an escaped pipe inside a cell does not split it.
 */
function splitRow(line) {
  let s = String(line).trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = [];
  let cur = '';
  let inCode = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
    if (c === '`') { inCode = !inCode; cur += c; continue; }
    if (c === '|' && !inCode) { cells.push(cur); cur = ''; continue; }
    cur += c;
  }
  cells.push(cur);
  return cells.map((x) => x.trim());
}

/**
 * Renders a table from its three parts.
 *
 * This used to be handed a flat array of lines and to index each body row as if it
 * were already an array of cells (`r[i]`), which quietly indexed the *characters* of
 * the row string, and it skipped the delimiter row, so the first body row was eaten
 * as the alignment row. Every table body in the archive rendered as garbage.
 */
function renderTable(headerLine, sepLine, bodyLines, code) {
  const head = splitRow(headerLine);
  if (!head.length) return null;
  const align = splitRow(sepLine).map((c) => {
    const l = c.startsWith(':');
    const r = c.endsWith(':');
    return l && r ? 'center' : r ? 'right' : l ? 'left' : '';
  });
  const cell = (t, i, tag) =>
    `<${tag}${align[i] ? ` style="text-align:${align[i]}"` : ''}>${inline(t, code)}</${tag}>`;
  const body = bodyLines.map(splitRow);
  return '<div class="md-table-wrap"><table><thead><tr>'
    + head.map((c, i) => cell(c, i, 'th')).join('')
    + '</tr></thead>'
    + (body.length
      ? `<tbody>${body.map((cells) => `<tr>${head.map((_, i) => cell(cells[i] ?? '', i, 'td')).join('')}</tr>`).join('')}</tbody>`
      : '')
    + '</table></div>';
}

/** Flat list items -> nested tree, so rendering is a simple recursion. */
function buildTree(items) {
  const root = { children: [] };
  const stack = [{ node: root, indent: -1 }];
  for (const it of items) {
    while (stack.length > 1 && stack[stack.length - 1].indent >= it.indent) stack.pop();
    const node = { ...it, children: [] };
    stack[stack.length - 1].node.children.push(node);
    stack.push({ node, indent: it.indent });
  }
  return root.children;
}

function renderTree(nodes, code) {
  let html = '';
  let i = 0;
  while (i < nodes.length) {
    const ordered = nodes[i].ordered;
    const group = [];
    while (i < nodes.length && nodes[i].ordered === ordered) group.push(nodes[i++]);
    const tag = ordered ? 'ol' : 'ul';
    const start = ordered && group[0].marker !== 1 ? ` start="${group[0].marker}"` : '';
    html += `<${tag}${start}>`;
    for (const n of group) {
      const box = n.task === null ? '' : `<span class="md-task" aria-hidden="true">${n.task ? '☑' : '☐'}</span>`;
      html += `<li${n.task === null ? '' : ' class="md-task-item"'}>${box}`;
      if (n.text) html += `<span>${inline(n.text, code)}</span>`;
      if (n.children.length) html += renderTree(n.children, code);
      // block content that belonged to this item (an indented fence, table, heading)
      if (n.blocks) html += n.blocks;
      html += '</li>';
    }
    html += `</${tag}>`;
  }
  return html;
}

/**
 * Parses one list, giving each item any block content that was indented under it.
 *
 * The continuation scan used to swallow *every* following non-blank line into the
 * item's text, which pulled indented fences and tables into a `<span>` and produced
 * invalid nesting (a `<figure>` inside a `<span>`) in 72 places.
 */
function parseList(ls, start, code) {
  const items = [];
  let j = start;
  while (j < ls.length) {
    const om = RE_OL.exec(ls[j]);
    const um = om ? null : RE_UL.exec(ls[j]);
    const m = om || um;
    if (!m) { if (ls[j].trim()) break; j++; continue; }

    const indent = m[1].replace(/\t/g, '  ').length;
    let text = m[3];
    let task = null;
    const cb = /^\[([ xX])\]\s+(.*)$/.exec(text);
    if (cb) { task = cb[1].toLowerCase() === 'x'; text = cb[2]; }
    const child = [];
    let k = j + 1;

    while (k < ls.length) {
      const ln = ls[k];
      if (!ln.trim()) {
        // a blank line only stays inside the item if an indented block follows it
        let p = k;
        while (p < ls.length && !ls[p].trim()) p++;
        if (p < ls.length && indentOf(ls[p]) > indent && !isListLine(ls[p])
            && isBlockStart(ls[p].trimStart())) { child.push(''); k++; continue; }
        break;
      }
      if (isListLine(ln)) break;                     // sibling or nested: the tree handles it
      const ind = indentOf(ln);
      if (ind > indent) {
        if (isBlockStart(ln.trimStart())) { child.push(ln.slice(Math.min(ind, indent + 2))); k++; continue; }
        text += ` ${ln.trim()}`;                     // indented prose still reads as the item
        k++;
        continue;
      }
      if (isBlockStart(ln.trimStart())) break;        // a new block at the list's own level
      text += ` ${ln.trim()}`;                       // lazy paragraph continuation
      k++;
    }

    items.push({
      indent,
      ordered: !!om,
      marker: om ? Number(m[2]) : 0,
      text,
      task,
      blocks: child.length ? renderBlocks(child, code) : '',
    });
    j = k;
  }
  return { items, next: j };
}

/** One block, starting at line `i`. Always returns `next > i` so the caller advances. */
function parseBlockAt(ls, i, code) {
  const line = ls[i];

  if (!line.trim()) return { html: '', next: i + 1 };
  if (ANY_TOKEN.test(line)) return { html: line.trim(), next: i + 1 };

  const math = RE_MATH_OPEN.exec(line);
  if (math) {
    const closer = math[1] === '$$' ? '$$' : '\\]';
    const rest = math[2];
    // `$$ x = y $$` on one line: the closer is already here. This used to be missed,
    // so the scan ran to the end of the message and swallowed everything after it
    // into the math div as raw text (20 messages in this archive).
    if (rest.includes(closer)) {
      return { html: mathBlock(rest.replace(closer, '')), next: i + 1 };
    }
    const body = [rest];
    let j = i + 1;
    let closed = false;
    for (; j < ls.length; j++) {
      body.push(ls[j]);
      if (ls[j].includes(closer)) { closed = true; break; }
    }
    if (closed) return { html: mathBlock(body.join('\n').replace(closer, '')), next: j + 1 };
    // Never closed: fall through and render it as ordinary text. Swallowing the rest
    // of the message would hide content, which is worse than showing stray `$$`.
  }

  if (RE_HR.test(line)) return { html: '<hr>', next: i + 1 };

  const h = RE_HEADING.exec(line);
  if (h) return { html: `<h${h[1].length}>${inline(h[2].trim(), code)}</h${h[1].length}>`, next: i + 1 };

  if (line.includes('|') && i + 1 < ls.length && isSepRow(ls[i + 1])) {
    const body = [];
    let j = i + 2;
    while (j < ls.length && ls[j].trim() && ls[j].includes('|')) { body.push(ls[j]); j++; }
    const table = renderTable(line, ls[i + 1], body, code);
    if (table) return { html: table, next: j };
  }

  if (RE_QUOTE.test(line)) {
    const inner = [];
    let j = i;
    while (j < ls.length && ls[j].trim()) {
      const qm = RE_QUOTE.exec(ls[j]);
      if (qm) { inner.push(qm[1] ?? ''); j++; continue; }
      // lazy continuation of the quoted paragraph
      if (inner.length && !isBlockStart(ls[j].trimStart()) && !isListLine(ls[j])) { inner.push(ls[j]); j++; continue; }
      break;
    }
    return { html: `<blockquote>${renderBlocks(inner, code)}</blockquote>`, next: j };
  }

  if (RE_UL.test(line) || RE_OL.test(line)) {
    const { items, next } = parseList(ls, i, code);
    if (items.length) return { html: renderTree(buildTree(items), code), next };
  }

  const para = [line];
  let j = i + 1;
  while (j < ls.length && ls[j].trim()
    && !RE_HEADING.test(ls[j]) && !RE_HR.test(ls[j]) && !isSepRow(ls[j])
    && !RE_UL.test(ls[j]) && !RE_OL.test(ls[j]) && !RE_QUOTE.test(ls[j])
    && !RE_TABLE_ROW.test(ls[j]) && !ANY_TOKEN.test(ls[j])
    && !isTableHeaderAt(ls, j)) {
    para.push(ls[j]);
    j++;
  }
  return { html: `<p>${para.map((p) => inline(p, code)).join('<br>')}</p>`, next: j };
}

function renderBlocks(ls, code) {
  const out = [];
  let i = 0;
  let guard = 0;
  while (i < ls.length) {
    if (++guard > ls.length + 32) throw new Error('markdown block parser failed to advance');
    const step = parseBlockAt(ls, i, code);
    if (step.html) out.push(step.html);
    i = step.next;
  }
  return out.join('\n');
}

/**
 * An artifact written inline in a message body. claude.ai showed these as a card that
 * opened the code in the side panel; here the body is rendered in place so nothing is
 * hidden, with a button that opens the same artifact in the panel.
 * @param {Array} code token store
 */
function artifactCard(code, { id, title, lang, type, raw, closed }) {
  const isMd = /markdown/.test(type || '');
  const inner = isMd ? escapeHtml(raw) : (highlight(raw, lang) ?? escapeHtml(raw));
  const what = isMd ? '文档' : /html/.test(type || '') ? '网页' : '代码';
  return code.push(
    `<figure class="md-code md-artifact" data-artifact="art:${escapeHtml(id)}">`
    + '<figcaption>'
    + '<span class="md-art-mark" aria-hidden="true">\u25c6</span>'
    + `<span class="md-art-title">${escapeHtml(title)}</span>`
    + `<span class="md-art-meta">工件 \u00b7 ${escapeHtml(what)}${lang ? ` \u00b7 ${escapeHtml(lang)}` : ''}${closed ? '' : ' \u00b7 未闭合'}</span>`
    + '<button type="button" class="md-open" data-open>在面板中打开</button>'
    + '<button type="button" class="md-copy" data-copy>复制</button>'
    + '</figcaption>'
    + `<pre><code>${inner}</code></pre></figure>`
  ) - 1;
}

/**
 * Renders one markdown string to HTML.
 * @param {string} src
 * @param {{codeBlocks?: Array}} [store] optional collector, used for search
 */
export function renderMarkdown(src, store) {
  if (!src) return '';
  const code = [];     // rendered snippets, referenced by token
  const fences = [];   // raw fences, for the caller

  const text = String(src).replace(/\r\n?/g, '\n').replace(/[\u2028\u2029]/g, '\n');

  // 1. pull fenced blocks out before anything else can touch them, keeping their
  //    indentation so a fence inside a list item can be placed back inside it
  const srcLines = text.split('\n');
  const kept = [];
  for (let i = 0; i < srcLines.length; i++) {
    // An inline artifact is pulled out the same way a fence is: it must not be parsed
    // as prose. Without this its body rendered as paragraphs, and lines that happened
    // to start with `#` became headings (108 messages in this archive).
    const ant = RE_ANT_OPEN.exec(srcLines[i]);
    if (ant) {
      const attr = {};
      for (const a of ant[1].matchAll(/([\w:-]+)="([^"]*)"/g)) attr[a[1].toLowerCase()] = a[2];
      const body = [];
      let j = i + 1;
      let closed = false;
      for (; j < srcLines.length; j++) {
        const cl = srcLines[j].indexOf('</antArtifact>');
        if (cl >= 0) { body.push(srcLines[j].slice(0, cl)); closed = true; break; }
        body.push(srcLines[j]);
      }
      const raw = body.join('\n').replace(/^\n/, '').replace(/\s+$/, '');
      const id = attr.identifier || attr.title || 'artifact';
      const lang = (attr.language || '').toLowerCase();
      kept.push(token('f', artifactCard(code, {
        id, title: attr.title || id, lang, type: attr.type || '', raw, closed,
      })));
      i = j;
      continue;
    }

    const m = RE_FENCE.exec(srcLines[i]);
    if (!m) { kept.push(srcLines[i]); continue; }
    const [, fence, langRaw] = m;
    const indent = /^\s*/.exec(srcLines[i])[0];
    const lang = (langRaw || '').toLowerCase();
    const closer = new RegExp(`^\\s{0,3}${fence[0] === '`' ? '`' : '~'}{${fence.length},}\\s*$`);
    const body = [];
    let j = i + 1;
    let closed = false;
    for (; j < srcLines.length; j++) {
      if (closer.test(srcLines[j])) { closed = true; break; }
      body.push(srcLines[j]);
    }
    // A fence that never closes inside a long message is probably prose.
    if (!closed && body.length > 200) { kept.push(srcLines[i]); continue; }
    const raw = body.join('\n');
    fences.push({ lang: lang || 'text', code: raw });
    const inner = lang === 'thinking' ? escapeHtml(raw) : (highlight(raw, lang) ?? escapeHtml(raw));
    const n = code.push(
      `<figure class="md-code${lang === 'thinking' ? ' md-code-thinking' : ''}">`
      + `<figcaption><span>${escapeHtml(lang || 'text')}</span>`
      + '<button type="button" class="md-copy" data-copy>复制</button></figcaption>'
      + `<pre><code>${inner}</code></pre></figure>`
    ) - 1;
    kept.push(indent + token('f', n));
    i = j;
  }

  // 2. escape what is left; tokens are NUL-delimited so they survive untouched
  const escaped = escapeHtml(kept.join('\n'));

  // 3. blocks
  const html = renderBlocks(escaped.split('\n'), code);

  if (store) { store.codeBlocks = fences; store.text = escaped; }
  return html.replace(ALL_TOKENS_G, (m, _kind, n) => code[Number(n)] ?? '');
}

/** Plain text of a markdown string, for previews and search snippets. */
export function markdownToText(src, limit = 0) {
  let s = String(src || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<\/?antArtifact\b[^>]*>/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+>]\s+/gm, '')
    .replace(/[*_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (limit && s.length > limit) s = s.slice(0, limit).trim() + '…';
  return s;
}
