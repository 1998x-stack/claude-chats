/**
 * Claude 存档 — a local, read-only viewer for a claude.ai data export.
 *
 * Three views: #/ (recent), #/all (every conversation), #/c/<id> (one conversation).
 * Search is the composer at the bottom of the page; it filters the sidebar live and
 * asks the local server for full-text matches, which the server computes in a few
 * milliseconds because it holds the corpus in memory.
 */
import { renderMarkdown, highlight } from './md.js';
import { collectArtifacts, attachmentRecord, baseName } from './artifacts.js';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    // event names are case-sensitive: addEventListener('Click') silently never fires
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

const svg = (paths, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths}</svg>`;

const ICON = {
  logo: svg('<path d="M12 3v18M3 12h18M5.9 5.9l12.2 12.2M18.1 5.9L5.9 18.1"/>', 'stroke-width="2.1"'),
  panel: svg('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9.5 4v16"/>'),
  caret: svg('<path d="M9 6l6 6-6 6"/>', 'stroke-width="2"'),
  chevron: svg('<path d="M6 9l6 6 6-6"/>', 'stroke-width="2"'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  file: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
  arrow: svg('<path d="M5 12h13M12 5l7 7-7 7"/>', 'stroke-width="2"'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>'),
  moon: svg('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>', 'stroke-width="2"'),
  doc: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
  code: svg('<path d="M9 18l-6-6 6-6M15 6l6 6-6 6"/>'),
  web: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'),
  bounce: svg('<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h4"/>'),
  copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'),
  download: svg('<path d="M12 3v12M7.5 10.5L12 15l4.5-4.5M4 20h16"/>'),
  collapse: svg('<path d="M15 6l-6 6 6 6"/><path d="M20 4v16"/>'),
};

const fmt = {
  bytes(n) {
    if (!n) return '';
    if (n < 1024) return `${n} B`;
    if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1048576).toFixed(1)} MB`;
  },
  num: (n) => (n || 0).toLocaleString('zh-CN'),
  day: (iso) => (iso ? iso.slice(0, 10).replace(/-/g, '-') : ''),
  dayCn(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${y}年${Number(m)}月${Number(d)}日`;
  },
  monthCn(iso) {
    if (!iso) return '';
    const [y, m] = iso.slice(0, 10).split('-');
    return `${y}年${Number(m)}月`;
  },
  time(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },
  short(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const sameYear = d.getFullYear() === now.getFullYear();
    return sameYear ? `${d.getMonth() + 1}月${d.getDate()}日` : `${d.getFullYear()}年${d.getMonth() + 1}月`;
  },
  dayDiff(a, b) {
    if (!a || !b) return 0;
    return (new Date(b.slice(0, 10)) - new Date(a.slice(0, 10))) / 86400000;
  },
};

const plain = (s) => (s || '').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s && s.length > n ? s.slice(0, n).trim() + '…' : s || '');

// --- artifacts -----------------------------------------------------------

const KIND_LABEL = { doc: '文档', artifact: '工件', file: '文件', attachment: '附件' };

const commentCount = (rec) => (Array.isArray(rec?.comments) ? rec.comments.length : (rec?.comments || 0));

const artGlyph = (rec) => (rec.format === 'html' ? ICON.web
  : rec.format === 'code' ? ICON.code
    : rec.kind === 'artifact' ? ICON.doc : ICON.file);

/** Where this item's body came from, shown in the panel's meta line. */
function sourceLabel(meta, rec) {
  if (meta.authoritative) return '导出原件';
  if (!rec && !meta.body) return '';
  if (meta.kind === 'attachment') return meta.body ? '导出内容' : '仅文件名';
  // artifacts the model wrote inline as <antArtifact> were never a tool call
  if (meta.inline || rec?.inline) return '消息内工件';
  return '由工具调用重建';
}

function formatLabel(rec) {
  if (rec.kind === 'doc') return '文档';
  if (rec.kind === 'attachment') return rec.lang ? `${rec.lang} 附件` : '附件';
  if (rec.format === 'html') return '网页';
  if (rec.format === 'markdown') return '文档';
  if (rec.kind === 'file') return rec.lang ? `${rec.lang} 文件` : '文件';
  return '代码';
}

function artCard(rec) {
  return el('button', {
    class: 'art-card',
    'data-shared': rec.shared ? 'true' : 'false',
    title: rec.path || rec.title,
    onClick: () => openArtifact(rec),
  },
    el('span', { class: 'art-glyph', html: artGlyph(rec) }),
    el('span', { class: 'art-card-text' },
      el('span', { class: 'art-card-title', text: rec.title }),
      el('span', { class: 'art-card-meta' },
        `${formatLabel(rec)}${rec.bytes ? ` · ${fmt.bytes(rec.bytes)}` : ''}`,
        rec.shared ? el('span', { class: 'art-card-note', text: ' · 已分享' }) : null,
        commentCount(rec) ? el('span', { text: ` · ${commentCount(rec)} 条评论` }) : null
      )
    )
  );
}

/** Clipboard API, with the old textarea trick behind it for restrictive contexts. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

const EXT_BY_LANG = {
  python: 'py', javascript: 'js', typescript: 'ts', html: 'html', json: 'json',
  bash: 'sh', sql: 'sql', css: 'css', yaml: 'yml', markdown: 'md', java: 'java',
};

/** A sensible filename for an artifact: its own path if it has one, else its title. */
function fileNameFor(rec) {
  if (rec.path) return baseName(rec.path);
  let base = String(rec.title || 'artifact').replace(/[\\/:*?"<>|]/g, '_').trim().slice(0, 80) || 'artifact';
  if (/\.[a-z0-9]{1,6}$/i.test(base)) return base;
  const extension = rec.format === 'markdown' ? 'md'
    : rec.format === 'html' ? 'html'
      : EXT_BY_LANG[rec.lang] || 'txt';
  return `${base}.${extension}`;
}

function downloadText(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = el('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** A button that copies, then reports what happened on itself. */
function copyButton(getText, { label = '复制', title = '复制', class: cls = 'act' } = {}) {
  return el('button', {
    class: cls,
    type: 'button',
    title,
    text: label,
    onClick: async (e) => {
      const btn = e.currentTarget;
      const ok = await copyText(getText());
      btn.textContent = ok ? '已复制' : '复制失败';
      setTimeout(() => { btn.textContent = label; }, 1400);
    },
  });
}

// ---------------------------------------------------------------------------
// state
// ---------------------------------------------------------------------------

const PREF_KEY = 'claude-archive:prefs';
const DEFAULTS = { theme: 'dark', thinking: false, tools: false, sidebar: 'open', recent: 40, recentOpen: true };

const prefs = { ...DEFAULTS };
try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch { /* ignore */ }
const savePrefs = () => {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
};

const state = {
  index: null,        // { builtAt, stats, chats }
  byId: new Map(),
  chat: null,
  chatCache: new Map(),
  view: { name: 'home', id: null },
  query: '',
  searching: false,   // true only while the user is typing in the composer
  results: null,      // { results, total, ms } | 'loading' | { error }
  searchSeq: 0,
  timer: 0,
  rowLimits: { home: 30, results: 200, artifacts: 200 },
  artIndex: null,     // { stats, items } — metadata for every artifact and file
  pages: null,        // exported rendered pages, keyed by Claude Docs container id
  art: null,          // artifacts rebuilt for the open conversation
  artByMsg: new Map(),
  attByKey: new Map(),  // attachment records, registered while the transcript renders
  artFilter: 'all',
  panel: null,        // { key, rec?, loading?, error? }
};

// ---------------------------------------------------------------------------
// loading
// ---------------------------------------------------------------------------

async function fetchJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).error || ''; } catch { /* not json */ }
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`);
  }
  return res.json();
}

async function loadIndex() {
  const data = await fetchJson('data/index.json');
  state.index = data;
  state.byId = new Map(data.chats.map((c) => [c.id, c]));
}

/** Chat files are up to a few MB; keep a couple around, drop the oldest. */
async function loadChat(id) {
  if (state.chatCache.has(id)) return state.chatCache.get(id);
  const chat = await fetchJson(`data/chats/${id}.json`);
  state.chatCache.set(id, chat);
  if (state.chatCache.size > 3) state.chatCache.delete(state.chatCache.keys().next().value);
  return chat;
}

async function loadArtIndex() {
  if (state.artIndex) return state.artIndex;
  state.artIndex = await fetchJson('data/artifacts.json');
  return state.artIndex;
}

async function loadPages() {
  if (!state.pages) state.pages = await fetchJson('data/pages.json').catch(() => ({}));
  return state.pages;
}

function statePanel({ title, body, code, action }) {
  return el('div', { class: 'state' },
    el('div', { class: 'state-title', text: title }),
    body && el('p', { class: 'state-body', text: body }),
    code && el('code', { class: 'state-code', text: code }),
    action && el('button', { class: 'btn', onClick: action.fn, text: action.label })
  );
}

// ---------------------------------------------------------------------------
// search
// ---------------------------------------------------------------------------

function clientMatches(q) {
  const needle = q.toLowerCase();
  return state.index.chats
    .map((c) => {
      const name = c.name.toLowerCase();
      const preview = (c.preview || '').toLowerCase();
      const summary = (c.summary || '').toLowerCase();
      let score = 0;
      let where = null;
      if (name === needle) { score = 1000; where = 'name'; }
      else if (name.startsWith(needle)) { score = 700; where = 'name'; }
      else if (name.includes(needle)) { score = 500; where = 'name'; }
      if (summary.includes(needle) && score < 300) { score = 300; where = 'summary'; }
      if (preview.includes(needle) && score < 200) { score = 200; where = 'preview'; }
      return score ? { id: c.id, score, where } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || state.byId.get(b.id).updated.localeCompare(state.byId.get(a.id).updated));
}

async function runSearch(q) {
  const seq = ++state.searchSeq;
  state.results = 'loading';
  renderSidebar();
  renderMain();
  let server = null;
  let error = null;
  try {
    server = await fetchJson(`api/search?q=${encodeURIComponent(q)}&limit=200`);
  } catch (e) {
    error = String(e.message || e);
  }
  if (seq !== state.searchSeq) return;   // a newer query已 superseded this one
  const local = clientMatches(q);
  const localScore = new Map(local.map((m) => [m.id, m.score]));
  const merged = new Map();
  for (const m of local) merged.set(m.id, { id: m.id, score: m.score, hits: 0, where: m.where });
  for (const r of server?.results || []) {
    const cur = merged.get(r.id);
    const score = (localScore.get(r.id) || 0) + Math.min(r.hits, 60);
    if (cur) { cur.hits = r.hits; cur.snippet = r.snippet; cur.score = score; }
    else merged.set(r.id, { id: r.id, score, hits: r.hits, snippet: r.snippet, where: 'content' });
  }
  const needle = q.toLowerCase();
  const artMatches = (state.artIndex?.items || [])
    .filter((i) => i.title.toLowerCase().includes(needle) || (i.path || '').toLowerCase().includes(needle))
    .sort((a, b) => (b.convUpdated || '').localeCompare(a.convUpdated || ''))
    .slice(0, 40);
  state.results = {
    query: q,
    total: merged.size,
    contentTotal: server?.total ?? 0,
    ms: server?.ms ?? 0,
    error,
    artMatches,
    rows: [...merged.values()].sort((a, b) => b.score - a.score
      || state.byId.get(b.id).updated.localeCompare(state.byId.get(a.id).updated)),
  };
  renderSidebar();
  renderMain();
}

function setQuery(q, { immediate = false } = {}) {
  state.query = q;
  $('#clear-search').hidden = !q;
  if (state.timer) clearTimeout(state.timer);
  if (!q.trim()) {
    state.results = null;
    state.searching = false;
    state.searchSeq++;
    renderSidebar();
    renderMain();
    return;
  }
  state.searching = true;
  state.timer = setTimeout(() => runSearch(q.trim()), immediate ? 0 : 160);
}

// ---------------------------------------------------------------------------
// sidebar
// ---------------------------------------------------------------------------

function highlightName(text, q) {
  if (!q) return [document.createTextNode(text)];
  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return [document.createTextNode(text)];
  return [
    document.createTextNode(text.slice(0, at)),
    el('span', { class: 'sb-hit', text: text.slice(at, at + q.length) }),
    document.createTextNode(text.slice(at + q.length)),
  ];
}

function sidebarRow(chat, q) {
  const active = state.view.name === 'chat' && state.view.id === chat.id;
  return el('li', {},
    el('button', {
      class: 'sb-item',
      'aria-current': active ? 'true' : 'false',
      title: `${chat.name}\n${fmt.dayCn(chat.updated)}`,
      onClick: () => { location.hash = `#/c/${chat.id}`; },
    },
      el('span', { class: 'sb-name' }, ...highlightName(chat.name, q)),
      el('span', { class: 'sb-date', text: fmt.short(chat.updated) })
    )
  );
}

function renderSidebar() {
  const body = $('#sb-body');
  const foot = $('#sb-foot');
  const chats = state.index?.chats || [];
  const q = state.query.trim();
  const artStats = state.artIndex?.stats;

  const list = el('ul', { class: 'sb-list', hidden: !q && !prefs.recentOpen });
  if (q) {
    const found = state.results && state.results !== 'loading' && !state.results.error
      ? state.results.rows.slice(0, 60).map((r) => state.byId.get(r.id)).filter(Boolean)
      : clientMatches(q).slice(0, 60).map((r) => state.byId.get(r.id));
    for (const c of found) list.append(sidebarRow(c, q));
    if (!found.length) {
      list.append(el('li', {}, el('div', {
        class: 'sb-empty',
        text: state.results === 'loading' ? '搜索中…' : '没有匹配的对话',
      })));
    }
  } else {
    for (const c of chats.slice(0, prefs.recent)) list.append(sidebarRow(c, ''));
  }

  const open = q ? true : prefs.recentOpen;
  body.replaceChildren(
    el('button', {
      class: 'sb-section',
      'aria-expanded': String(open),
      onClick: () => {
        if (q) { location.hash = '#/all'; return; }
        prefs.recentOpen = !prefs.recentOpen;
        savePrefs();
        renderSidebar();
      },
    },
      el('span', { class: 'sb-caret', html: ICON.caret }),
      el('span', { text: q ? '搜索结果' : '最近使用' }),
      el('span', { class: 'sb-count', text: String(q ? list.children.length : Math.min(prefs.recent, chats.length)) })
    ),
    list,
    el('button', {
      class: 'sb-more',
      text: q ? '查看全部对话' : `查看全部 ${fmt.num(chats.length)} 个对话`,
      onClick: () => { location.hash = '#/all'; },
    }),
    artStats
      ? el('button', {
        class: 'sb-more',
        text: `全部产物 · ${fmt.num(artStats.docs)} 个文档 / ${fmt.num(artStats.files)} 个文件`,
        onClick: () => { location.hash = '#/artifacts'; },
      })
      : null
  );

  const user = state.index?.user || {};
  const stats = state.index?.stats || {};
  foot.replaceChildren(
    el('div', { class: 'avatar', text: (user.name || '?').slice(0, 1).toUpperCase() }),
    el('div', { class: 'sb-user' },
      el('div', { class: 'sb-user-name', text: user.name || '本地' }),
      el('div', { class: 'sb-user-meta', text: `${fmt.num(stats.conversations)} 个对话 · 只读` })
    )
  );
}

// ---------------------------------------------------------------------------
// topbar
// ---------------------------------------------------------------------------

/** The sidebar's open/closed state, shared by the header chevron and the top bar. */
function setSidebar(mode) {
  prefs.sidebar = mode;
  savePrefs();
  $('.app').dataset.sidebar = mode;
}

function toggleSidebar() {
  const opening = prefs.sidebar !== 'open';
  // Below ~1100px both the sidebar and the document panel are overlays, and they
  // would sit on top of each other, so only one can be open at a time.
  if (opening && window.matchMedia('(max-width: 1100px)').matches && state.panel) closePanel();
  setSidebar(opening ? 'open' : 'closed');
}

function toggleChip(label, on, onClick) {
  return el('button', {
    class: 'chip',
    'aria-pressed': on ? 'true' : 'false',
    onClick,
  }, el('span', { class: 'chip-dot' }), el('span', { text: label }));
}

function renderTopbar({ title, meta }) {
  const bar = $('#topbar');
  bar.replaceChildren(
    el('div', { class: 'top-title', title: title || '' },
      title || '',
      meta ? el('span', { class: 'top-meta', text: `  ${meta}` }) : null
    ),
    el('div', { class: 'controls' },
      toggleChip('思考', prefs.thinking, () => { prefs.thinking = !prefs.thinking; savePrefs(); renderMain(); }),
      toggleChip('工具', prefs.tools, () => { prefs.tools = !prefs.tools; savePrefs(); renderMain(); }),
      el('button', {
        class: 'chip',
        title: '把整段对话复制成 Markdown',
        text: '复制对话',
        onClick: async (e) => {
          const ok = await copyText(conversationMarkdown());
          e.currentTarget.textContent = ok ? '已复制' : '复制失败';
          setTimeout(() => { e.currentTarget.textContent = '复制对话'; }, 1400);
        },
      }),
      el('button', {
        class: 'icon-btn',
        title: prefs.theme === 'dark' ? '切换到浅色' : '切换到深色',
        'aria-label': '切换主题',
        onClick: (e) => {
          prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
          savePrefs();
          document.documentElement.dataset.theme = prefs.theme;
          e.currentTarget.innerHTML = prefs.theme === 'dark' ? ICON.sun : ICON.moon;
        },
        html: prefs.theme === 'dark' ? ICON.sun : ICON.moon,
      }),
      el('button', {
        class: 'icon-btn',
        title: prefs.sidebar === 'open' ? '收起侧栏' : '展开侧栏',
        'aria-label': '切换侧边栏',
        html: ICON.panel,
        onClick: (e) => {
          toggleSidebar();
          e.currentTarget.title = prefs.sidebar === 'open' ? '收起侧栏' : '展开侧栏';
        },
      })
    )
  );
}

/** The whole conversation as Markdown, for copying it out of the archive. */
function conversationMarkdown() {
  const chat = state.chat;
  if (!chat) return '';
  const lines = [`# ${chat.name || chat.displayName}`, ''];
  if (chat.created) lines.push(`> ${chat.created.slice(0, 10)} · 导出自 claude.ai 本地存档`, '');
  for (const m of chat.messages) {
    const parts = m.blocks.filter((b) => b.k === 'text').map((b) => b.md);
    if (!parts.length) continue;
    lines.push(m.sender === 'human' ? '## 你' : '## Claude', '', ...parts, '');
    for (const a of m.attachments || []) lines.push(`（附件：${a.name}）`, '');
  }
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

// ---------------------------------------------------------------------------
// list views
// ---------------------------------------------------------------------------

function rowEl(chat, { q = '' } = {}) {
  const nameParts = q ? highlightName(chat.name, q) : [document.createTextNode(chat.name)];
  const empty = chat.messages === 0;
  const previewText = clip(plain(chat.preview || chat.summary || ''), 180);
  const meta = [];
  // 73 conversations were never named and 79 hold no messages at all; say so
  // rather than showing an empty row that looks broken.
  if (!chat.named && chat.preview) meta.push('标题为自动生成');
  meta.push(`${fmt.num(chat.messages)} 条消息`);
  if (chat.hasThinking) meta.push('含思考');
  if (chat.attachments) meta.push(`${chat.attachments} 个附件`);
  return el('li', { class: 'row' },
    el('a', { class: 'row-link', href: `#/c/${chat.id}` },
      el('span', { class: 'row-name' }, ...nameParts),
      el('span', { class: 'row-side' },
        el('span', { text: fmt.short(chat.updated) }),
        el('span', { text: fmt.bytes(chat.bytes) })
      ),
      el('span', { class: 'row-preview' },
        empty
          ? el('span', { class: 'row-none', text: '这段对话在导出里没有消息' })
          : (previewText
            ? el('span', {}, ...(q ? highlightName(previewText, q) : [document.createTextNode(previewText)]))
            : null),
        el('span', { class: 'row-meta' }, ...meta.map((m) => el('span', { text: m })))
      )
    )
  );
}

function renderHome() {
  const chats = state.index.chats;
  renderTopbar({ title: 'Claude 存档', meta: `${fmt.num(chats.length)} 个对话` });
  const shown = chats.slice(0, state.rowLimits.home);
  $('#thread').replaceChildren(
    el('div', { class: 'list-head' },
      el('span', { class: 'list-title', text: '最近使用' }),
      el('span', { class: 'list-note', text: `${fmt.day(state.index.stats.firstDate)} → ${fmt.day(state.index.stats.lastDate)} · 只读存档` })
    ),
    el('ul', { class: 'rows' }, ...shown.map((c) => rowEl(c))),
    chats.length > shown.length
      ? el('button', {
        class: 'sb-more',
        style: 'margin-top:14px',
        text: `显示更早的 ${fmt.num(chats.length - shown.length)} 个对话`,
        onClick: () => { state.rowLimits.home += 60; renderMain(); },
      })
      : null
  );
}

function renderAll() {
  const chats = state.index.chats;
  renderTopbar({ title: '全部对话', meta: fmt.num(chats.length) });
  const rows = [];
  let month = null;
  for (const c of chats) {
    const m = fmt.monthCn(c.updated);
    if (m !== month) { month = m; rows.push(el('div', { class: 'month', text: m })); }
    rows.push(rowEl(c));
  }
  $('#thread').replaceChildren(
    el('div', { class: 'list-head' },
      el('span', { class: 'list-title', text: '全部对话' }),
      el('span', { class: 'list-note', text: `按最后更新排序 · ${fmt.num(chats.length)} 个` })
    ),
    el('ul', { class: 'rows rows-compact' }, ...rows)
  );
}

function renderResults() {
  const r = state.results;
  const q = state.query.trim();
  if (r === 'loading') {
    renderTopbar({ title: `搜索“${q}”` });
    $('#thread').replaceChildren(el('div', { class: 'skeleton' },
      el('div', { class: 'sk-line' }), el('div', { class: 'sk-line' }),
      el('div', { class: 'sk-line' }), el('div', { class: 'sk-line' })));
    return;
  }
  if (!r) return renderHome();
  renderTopbar({ title: `搜索“${q}”`, meta: r.error ? '仅标题' : `${fmt.num(r.total)} 个结果` });
  if (!r.rows.length) {
    $('#thread').replaceChildren(statePanel({
      title: '没有找到匹配的内容',
      body: r.error
        ? `全文搜索不可用（${r.error}）。请确认页面是通过 node tools/serve.mjs 打开的，而不是直接双击 HTML 文件。`
        : '换个词试试。搜索会匹配对话标题、你的提问、回复正文、思考过程、工具输出，以及粘贴进来的附件内容。',
    }));
    return;
  }
  const rows = r.rows.slice(0, state.rowLimits.results).map((hit) => {
    const chat = state.byId.get(hit.id);
    if (!chat) return null;
    const row = rowEl(chat, { q });
    const prev = $('.row-preview', row);
    if (hit.snippet) {
      prev.replaceChildren(el('span', {}, ...highlightName(hit.snippet, q)));
    }
    if (hit.hits) {
      prev.append(el('span', { class: 'row-meta' }, el('span', { text: `命中 ${fmt.num(hit.hits)} 次` })));
    }
    return row;
  }).filter(Boolean);
  $('#thread').replaceChildren(
    el('div', { class: 'list-head' },
      el('span', { class: 'list-title', text: `搜索“${q}”` }),
      el('span', {
        class: 'list-note',
        text: r.error
          ? '仅匹配了标题与开头'
          : `${fmt.num(r.total)} 个对话 · ${fmt.num(r.contentTotal)} 个含正文匹配 · ${r.ms} ms`,
      })
    ),
    el('ul', { class: 'rows' }, ...rows),
    r.artMatches?.length
      ? el('div', { class: 'list-head' },
        el('span', { class: 'list-title', text: '匹配的产物' }),
        el('span', { class: 'list-note', text: `${r.artMatches.length} 项，按标题与路径匹配` }),
        el('button', {
          class: 'text-btn',
          text: '查看全部产物',
          onClick: () => { location.hash = '#/artifacts'; },
        }))
      : null,
    r.artMatches?.length
      ? el('ul', { class: 'rows rows-compact' }, ...r.artMatches.slice(0, 20).map(artRow))
      : null
  );
}

// ---------------------------------------------------------------------------
// chat rendering
// ---------------------------------------------------------------------------

const ARG_KEYS = ['path', 'file_path', 'command', 'query', 'url', 'title', 'pattern', 'subject', 'name'];

function toolArg(block) {
  const input = block.input;
  if (typeof input === 'string') return input;
  if (input && typeof input === 'object') {
    for (const k of ARG_KEYS) {
      const v = input[k];
      if (typeof v === 'string' && v.trim()) return k === 'command' ? v.split('\n')[0] : v;
    }
    for (const k of ['paths', 'files', 'file_paths']) {
      if (Array.isArray(input[k]) && input[k].length) return input[k].join('  ');
    }
    try { return JSON.stringify(input); } catch { return ''; }
  }
  return '';
}

function lazyDetails(node, render) {
  node.addEventListener('toggle', () => {
    if (!node.open || node.dataset.filled === '1') return;
    node.dataset.filled = '1';
    const box = $('.lazy-slot', node);
    if (box) box.replaceChildren(render());
  });
  return node;
}

function preBlock(text, { err = false, cap = 4000, label } = {}) {
  const full = String(text ?? '');
  const pre = el('pre', { class: 'tool-block', 'data-err': err ? 'true' : null });
  pre.textContent = full.length > cap ? full.slice(0, cap) : full;
  if (full.length <= cap) return pre;
  const wrap = el('div', {});
  wrap.append(pre,
    el('button', {
      class: 'file-more',
      text: `显示全部（共 ${fmt.num(full.length)} 字符）`,
      onClick: (e) => {
        pre.textContent = full;
        e.currentTarget.remove();
      },
    }));
  if (label) wrap.prepend(el('div', { class: 'disc-note', text: label }));
  return wrap;
}

function toolItem(block) {
  const { input, result } = block;
  const arg = toolArg(block);
  const hasInput = input !== null && input !== undefined && !(typeof input === 'object' && !Object.keys(input).length);
  const resultText = (result?.parts || []).map((p) => p.text).filter(Boolean).join('\n\n');
  const extra = (result?.extra || []).filter((x) => x.url || x.file_path || x.title);

  const item = el('li', { class: 'tool', 'data-error': result?.isError ? 'true' : null },
    el('div', { class: 'tool-head' },
      el('span', { class: 'tool-name', text: block.name }),
      el('span', { class: 'tool-arg', title: arg, text: clip(arg, 160) }),
      result?.isError ? el('span', { class: 'tool-flag', text: '失败' }) : null
    )
  );

  const detail = el('details', { class: 'tool-detail' },
    el('summary', { text: `详情${resultText ? ` · ${fmt.num(resultText.length)} 字符输出` : ''}` }),
    el('div', { class: 'lazy-slot' })
  );
  lazyDetails(detail, () => {
    const frag = document.createDocumentFragment();
    if (hasInput) {
      let pretty;
      try { pretty = JSON.stringify(input, null, 2); } catch { pretty = String(input); }
      frag.append(el('div', { class: 'disc-note', text: '输入' }), preBlock(pretty, { cap: 6000 }));
    }
    if (resultText) {
      frag.append(el('div', { class: 'disc-note', text: '输出' }), preBlock(resultText, { err: result.isError, cap: 8000 }));
    }
    if (extra.length) {
      frag.append(el('ul', { class: 'rows' }, ...extra.slice(0, 20).map((x) =>
        el('li', {}, el('span', { class: 'tool-arg', text: x.title || x.file_path || x.url })))));
    }
    if (!hasInput && !resultText && !extra.length) frag.append(el('div', { class: 'disc-note', text: '没有可显示的内容' }));
    return frag;
  });
  item.append(detail);
  return item;
}

function toolRunEl(run) {
  const counts = new Map();
  for (const b of run) {
    const cur = counts.get(b.kind);
    if (cur) cur.n++;
    else counts.set(b.kind, { n: 1, label: b.label, kind: b.kind });
  }
  const label = [...counts.values()]
    .sort((a, b) => b.n - a.n)
    .map((c) => (c.label || '调用了 %n 个工具').replace('%n', c.n))
    .join(' · ');
  const errors = run.filter((b) => b.result?.isError).length;
  const box = el('details', { class: 'tools', open: prefs.tools ? '' : null },
    el('summary', {},
      el('span', { class: 'tools-label', text: label + (errors ? ` · ${errors} 个失败` : '') }),
      el('span', { class: 'disc-caret', html: ICON.caret })
    ),
    el('div', { class: 'lazy-slot' })
  );
  lazyDetails(box, () => el('ul', { class: 'tool-list' }, ...run.map(toolItem)));
  return box;
}

function thinkingEl(block) {
  const len = block.md.length;
  const note = block.ms ? `${(block.ms / 1000).toFixed(1)} 秒 · ${fmt.num(len)} 字符` : `${fmt.num(len)} 字符`;
  const box = el('details', { class: 'disc', open: prefs.thinking ? '' : null },
    el('summary', {},
      el('span', { class: 'disc-caret', html: ICON.caret }),
      el('span', { text: '思考过程' }),
      el('span', { class: 'disc-note', text: note })
    ),
    el('div', { class: 'lazy-slot' })
  );
  lazyDetails(box, () => el('div', { class: 'disc-body' },
    el('div', { class: 'md', html: renderMarkdown(block.md) })));
  return box;
}

function injectedEl(blocks) {
  const box = el('details', {
    class: 'disc disc-injected',
    title: 'claude.ai 不显示这些内容：它们是系统在后台注入的提示词',
  },
    el('summary', {},
      el('span', { class: 'disc-caret', html: ICON.caret }),
      el('span', { text: '系统注入' }),
      el('span', { class: 'disc-note', text: `${blocks.length} 条` })
    ),
    el('div', { class: 'lazy-slot' })
  );
  lazyDetails(box, () => el('div', { class: 'disc-body' },
    ...blocks.map((b) => el('div', {},
      el('div', { class: 'disc-note', text: b.source || '注入' }),
      el('div', { class: 'md', html: renderMarkdown(b.md) })))));
  return box;
}

/**
 * Attachments open in the document panel like everything else, so they can be read
 * full width, copied, and downloaded. Records are registered as they render, which
 * means no separate pass over the conversation.
 */
function attachmentsEl(msg, reg) {
  if (!msg.attachments.length && !msg.files.length) return null;
  const wrap = el('div', { class: 'files' });
  msg.attachments.forEach((a, i) => {
    const rec = attachmentRecord(msg.id, i, a);
    if (reg) reg.set(rec.key, rec);
    const hasText = !!a.text;
    wrap.append(el(hasText ? 'button' : 'span', {
      class: 'file',
      title: hasText ? `${rec.title} — 在右侧打开` : `${rec.title} — 导出里只有文件名`,
      onClick: hasText ? () => openArtifact(rec) : null,
    },
      el('span', { html: ICON.file }),
      el('span', { text: rec.title }),
      a.size ? el('span', { class: 'file-size', text: fmt.bytes(a.size) }) : null
    ));
  });
  for (const f of msg.files) {
    if (msg.attachments.some((a) => a.name === f)) continue;
    wrap.append(el('span', { class: 'file', title: `${f} — 导出里只有文件名` },
      el('span', { html: ICON.file }), el('span', { text: f })));
  }
  return wrap;
}

/** Timestamp plus per-message copy, revealed on hover or focus. */
function messageFoot(msg, markdown) {
  return el('div', { class: 'msg-foot' },
    el('span', { class: 'stamp', text: fmt.time(msg.ts), title: msg.ts || '' }),
    markdown?.trim()
      ? copyButton(() => markdown, { title: '复制这条消息的 Markdown' })
      : null
  );
}

/**
 * Human messages render as a right-aligned bubble; assistant messages render as
 * prose with collapsible thinking and tool disclosures, then cards for whatever
 * artifacts, documents, or shared files the turn produced.
 *
 * `injected_prompt_block` entries (date notes, agent listings, system reminders)
 * are internal scaffolding that claude.ai never shows. They are kept out of the
 * bubble and put behind a collapsed disclosure, so nothing is silently dropped and
 * nothing is misattributed to the user either.
 */
function messageEl(msg, prevTs, arts, attReg) {
  const nodes = [];
  // the visible prose, for the per-message copy button
  const mdText = msg.blocks.filter((b) => b.k === 'text').map((b) => b.md).join('\n\n');
  if (msg.sender === 'human') {
    if (msg.toolResultOnly && !msg.blocks.some((b) => b.k === 'text')) return { node: null, ts: msg.ts };
    const bubble = el('div', { class: 'bubble' });
    const files = attachmentsEl(msg, attReg);
    if (files) bubble.append(files);
    const injected = [];
    for (const b of msg.blocks) {
      if (b.k === 'text') bubble.append(el('div', { class: 'md', html: renderMarkdown(b.md) }));
      else if (b.k === 'injected') injected.push(b);
    }
    if (!bubble.children.length && !injected.length) return { node: null, ts: msg.ts };
    return {
      node: el('article', { class: 'msg msg-user', dataset: { ts: msg.ts || '' } },
        bubble.children.length ? bubble : null,
        injected.length ? injectedEl(injected) : null,
        messageFoot(msg, mdText)),
      ts: msg.ts,
    };
  }

  // assistant: render blocks in order, grouping consecutive tool calls into one chip
  const run = [];
  const flush = () => {
    if (run.length) { nodes.push(toolRunEl(run.splice(0, run.length))); }
  };
  const injected = [];
  for (const b of msg.blocks) {
    if (b.k === 'tool') { run.push(b); continue; }
    flush();
    if (b.k === 'text') nodes.push(el('div', { class: 'md', html: renderMarkdown(b.md) }));
    else if (b.k === 'thinking') nodes.push(thinkingEl(b));
    else if (b.k === 'injected') injected.push(b);
  }
  flush();
  if (injected.length) nodes.push(injectedEl(injected));
  if (arts?.length) {
    const shown = arts.slice(0, 6);
    const box = el('div', { class: 'arts' });
    for (const rec of shown) box.append(artCard(rec));
    if (arts.length > shown.length) {
      box.append(el('button', {
        class: 'art-card',
        text: `还有 ${arts.length - shown.length} 项…`,
        onClick: () => { location.hash = '#/artifacts'; },
      }));
    }
    nodes.push(box);
  }
  if (!nodes.length) return { node: null, ts: msg.ts };
  return {
    node: el('article', { class: 'msg msg-asst', dataset: { ts: msg.ts || '' } },
      ...nodes, messageFoot(msg, mdText)),
    ts: msg.ts,
  };
}

function renderChat() {
  const chat = state.chat;
  const title = chat.name || chat.displayName;
  renderTopbar({
    title,
    meta: `${fmt.day(chat.created)} · ${fmt.num(chat.messages.length)} 条`,
  });

  // Rebuild this conversation's artifacts once, before rendering its messages.
  // Only shared files get transcript cards; everything stays in the artifacts view.
  state.art = collectArtifacts(chat, state.pages);
  state.artByMsg = new Map();
  state.attByKey = new Map();
  for (const rec of [...state.art.docs, ...state.art.files]) {
    if (rec.kind === 'file' && !rec.shared) continue;
    for (const mi of rec.msgs) {
      const arr = state.artByMsg.get(mi) || [];
      arr.push(rec);
      state.artByMsg.set(mi, arr);
    }
  }

  const frag = document.createDocumentFragment();
  let prevTs = null;
  let first = true;
  for (let mi = 0; mi < chat.messages.length; mi++) {
    const msg = chat.messages[mi];
    const dayChanged = !prevTs || msg.ts?.slice(0, 10) !== prevTs.slice(0, 10) || fmt.dayDiff(prevTs, msg.ts) > 1;
    const { node } = messageEl(msg, prevTs, state.artByMsg.get(mi), state.attByKey);
    if (!node) continue;
    // No separator above the first message: the top bar already carries the date.
    if (dayChanged && msg.ts && !first) {
      frag.append(el('div', { class: 'daysep', dataset: { ts: msg.ts.slice(0, 10) } },
        el('span', { text: fmt.dayCn(msg.ts) })));
    }
    node.dataset.mi = String(mi);
    frag.append(node);
    first = false;
    prevTs = msg.ts || prevTs;
  }

  const thread = $('#thread');
  thread.replaceChildren(frag);
  if (!thread.children.length) {
    thread.replaceChildren(statePanel({
      title: '这段对话没有消息',
      body: '它在 claude.ai 上存在，但导出里是空的 — 可能是只打开了对话页而没有发送内容。',
      action: { label: '返回列表', fn: () => { location.hash = '#/'; } },
    }));
  }
  applyHighlight(chat);
  queueMicrotask(() => { buildRail(); scrollToLanding(chat); });
}

/**
 * Highlights the current query in an open conversation.
 *
 * Collapsed disclosures (thinking, tool input/output) are rendered lazily, so the
 * term may exist only in the data. This checks the message data first, marks those
 * messages for the rail, expands the ones whose match is not already visible, and
 * only then walks the rendered text.
 */
function messageContains(msg, needle) {
  const parts = [];
  for (const b of msg.blocks) {
    if (b.k === 'text' || b.k === 'thinking' || b.k === 'injected') parts.push(b.md);
    else if (b.k === 'tool') {
      if (b.input) { try { parts.push(JSON.stringify(b.input)); } catch { /* circular */ } }
      if (b.result) for (const p of b.result.parts) parts.push(p.text);
    }
  }
  for (const a of msg.attachments) parts.push(a.text);
  for (const f of msg.files) parts.push(f);
  return parts.join('\n').toLowerCase().includes(needle);
}

function applyHighlight(chat) {
  const q = state.query.trim();
  if (!q || q.length < 2) return;
  const needle = q.toLowerCase();
  const thread = $('#thread');

  let toOpen = 0;
  for (const art of thread.querySelectorAll('.msg[data-mi]')) {
    const msg = chat.messages[Number(art.dataset.mi)];
    if (!msg || !messageContains(msg, needle)) continue;
    art.dataset.hit = 'true';
    // only expand when the match is not already on screen
    if (!art.textContent.toLowerCase().includes(needle) && toOpen < 60) {
      for (const d of art.querySelectorAll('details')) {
        if (!d.open) { d.open = true; toOpen++; }
      }
    }
  }

  paintMarks(thread, needle);
  // lazy disclosures fill on a queued `toggle` task, so a second pass catches them
  if (toOpen) {
    setTimeout(() => {
      paintMarks(thread, needle);
      buildRail();
      const first = thread.querySelector('mark.hit');
      if (first) first.scrollIntoView({ block: 'center' });
    }, 0);
  }
}

function paintMarks(thread, needle) {
  let count = 0;
  for (const node of thread.querySelectorAll('.md, .tool-arg, .file, .tool-block, .file-body')) {
    if (count > 300) break;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue.length > 1 && n.nodeValue.toLowerCase().includes(needle)
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    for (const t of texts) {
      if (count > 300) break;
      const val = t.nodeValue;
      const low = val.toLowerCase();
      const frag = document.createDocumentFragment();
      let from = 0;
      let at = low.indexOf(needle);
      while (at >= 0) {
        if (at > from) frag.append(document.createTextNode(val.slice(from, at)));
        frag.append(el('mark', { class: 'hit', text: val.slice(at, at + needle.length) }));
        count++;
        from = at + needle.length;
        at = low.indexOf(needle, from);
        if (count > 300) break;
      }
      frag.append(document.createTextNode(val.slice(from)));
      t.replaceWith(frag);
    }
  }
  const first = thread.querySelector('mark.hit');
  if (first) first.dataset.active = 'true';
}

/** A long chat opens at its last message, like claude.ai; a short one at the top. */
function scrollToLanding(chat) {
  const scroller = $('#scroller');
  const msgs = $('#thread').querySelectorAll('.msg');
  const first = $('#thread').querySelector('mark.hit');
  if (first) {
    first.scrollIntoView({ block: 'center' });
    return;
  }
  if (scroller.scrollHeight > scroller.clientHeight + 200 && msgs.length) {
    const last = msgs[msgs.length - 1];
    const top = last.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTop = Math.max(0, top - 12);
  } else {
    scroller.scrollTop = 0;
  }
}

// ---------------------------------------------------------------------------
// rail: a positional index of the conversation, in the gutter beside the column
// ---------------------------------------------------------------------------

const railTicks = [];

function buildRail() {
  const rail = $('#rail');
  const scroller = $('#scroller');
  const thread = $('#thread');
  railTicks.length = 0;
  rail.querySelectorAll('.rail-tick, .rail-thumb, .rail-tip').forEach((n) => n.remove());

  if (state.view.name !== 'chat' || !thread.children.length) { rail.hidden = true; railTicks.length = 0; return; }
  // Unhide before measuring: a hidden element reports clientHeight 0, which made
  // this bail out on the first render and never draw anything.
  rail.hidden = false;
  const railH = rail.clientHeight;
  const total = thread.scrollHeight;
  if (!railH || total < 40) { rail.hidden = true; return; }

  const scTop = scroller.getBoundingClientRect().top;
  const scrolled = scroller.scrollTop;
  const msgs = [...thread.querySelectorAll('.msg')];
  if (!msgs.length) { rail.hidden = true; return; }
  const frag = document.createDocumentFragment();
  for (const m of msgs) {
    const r = m.getBoundingClientRect();
    const top = r.top - scTop + scrolled;
    const h = r.height;
    const tick = el('div', {
      class: 'rail-tick',
      dataset: {
        sender: (m.classList.contains('msg-user') ? 'human' : 'assistant'),
        hit: m.dataset.hit || 'false',
        idx: m.dataset.mi,
      },
    });
    tick.style.top = `${Math.max(0, Math.min(railH - 2, (top / total) * railH))}px`;
    tick.style.height = `${Math.max(2, Math.min(railH, (h / total) * railH))}px`;
    railTicks.push({ tick, pos: top, el: m, text: plain(m.textContent).slice(0, 90) });
    frag.append(tick);
  }
  const thumb = el('div', { class: 'rail-thumb' });
  frag.append(thumb, el('div', { class: 'rail-tip', hidden: true }));
  rail.append(frag);
  updateThumb();
}

function updateThumb() {
  const rail = $('#rail');
  const scroller = $('#scroller');
  const thumb = $('.rail-thumb', rail);
  if (!thumb) return;
  const total = $('#thread').scrollHeight;
  const railH = rail.clientHeight;
  if (total <= 0) return;
  const top = (scroller.scrollTop / total) * railH;
  const h = Math.max(14, (scroller.clientHeight / total) * railH);
  thumb.style.top = `${top}px`;
  thumb.style.height = `${Math.min(railH - top, h)}px`;
}

function railJump(clientY) {
  const rail = $('#rail');
  const scroller = $('#scroller');
  const r = rail.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
  scroller.scrollTop = ($('#thread').scrollHeight - scroller.clientHeight) * ratio;
}

function railTipShow(clientY) {
  const rail = $('#rail');
  const tip = $('.rail-tip', rail);
  if (!tip) return;
  const r = rail.getBoundingClientRect();
  const y = clientY - r.top;
  let best = null;
  for (const t of railTicks) {
    const tt = parseFloat(t.tick.style.top);
    const th = parseFloat(t.tick.style.height);
    if (y >= tt && y <= tt + th) { best = t; break; }
  }
  if (!best) { tip.hidden = true; return; }
  const text = best.text || `第 ${Number(best.el.dataset.mi) + 1} 条消息`;
  tip.hidden = false;
  tip.textContent = text || `第 ${Number(best.el.dataset.index) + 1} 条消息`;
  tip.style.top = `${Math.max(0, Math.min(r.height - 26, y))}px`;
}

// ---------------------------------------------------------------------------
// artifact panel
// ---------------------------------------------------------------------------

/** Rebuilds one record from its conversation, given the key used in the index. */
function findRecordInChat(chat, key) {
  if (key.startsWith('att:')) {
    const [, msgId, idx] = key.split(':');
    const msg = (chat.messages || []).find((m) => m.id === msgId);
    const a = msg?.attachments?.[Number(idx)];
    return a ? attachmentRecord(msgId, Number(idx), a) : null;
  }
  const { docs, files } = collectArtifacts(chat, state.pages);
  return [...docs, ...files].find((r) => r.key === key) || null;
}

/** Opens an artifact. Accepts either a rebuilt record from the open conversation,
 *  or a metadata entry from the index, in which case its conversation is fetched
 *  and the body rebuilt on demand. */
async function openArtifact(item) {
  const key = item.key;
  const convId = item.conv || state.chat?.id;
  const hasBody = typeof item.body === 'string';
  state.panel = { key, convId, meta: item, rec: hasBody ? item : null, loading: !hasBody, tab: 'preview' };
  // A document needs width. If the sidebar is taking some and the window is not
  // huge, get it out of the way for as long as the panel is open.
  if (prefs.sidebar === 'open' && window.innerWidth < 1440) {
    state.autoCollapsed = true;
    $('.app').dataset.sidebar = 'closed';
  }
  renderPanel();
  if (hasBody) return;
  try {
    await loadPages();
    const chat = await loadChat(convId);
    const rec = findRecordInChat(chat, key);
    if (!rec) throw new Error('在这段对话里没有找到这个产物');
    if (state.panel?.key !== key) return;   // a different artifact was opened meanwhile
    state.panel.rec = rec;
    state.panel.loading = false;
    renderPanel();
  } catch (e) {
    if (state.panel?.key !== key) return;
    state.panel.loading = false;
    state.panel.error = String(e.message || e);
    renderPanel();
  }
}

function closePanel() {
  state.panel = null;
  if (state.autoCollapsed) {
    state.autoCollapsed = false;
    $('.app').dataset.sidebar = prefs.sidebar;
  }
  renderPanel();
}

function panelNote(rec) {
  const notes = [];
  if (rec.authoritative) notes.push('这是导出里附带的渲染页面，内容与 claude.ai 上一致。');
  else if (rec.kind === 'doc') notes.push(`由 ${rec.ops || 0} 次文档编辑调用重建，可能与最终页面有出入。`);
  else if (rec.kind === 'artifact' && rec.inline) notes.push('这个工件写在消息正文里（<antArtifact>），不是工具调用，正文即导出原文。');
  else if (rec.kind === 'artifact') notes.push(`由工具调用重建（${rec.revisions || 1} 次版本）${rec.partial ? '，其中部分修改无法复原' : ''}。`);
  else if (rec.kind === 'attachment') {
    notes.push(rec.body
      ? '这是你当时上传给 Claude 的附件，正文是导出里提取出来的文本。'
      : '导出里只有这个附件的文件名，没有正文内容。');
  } else if (rec.kind === 'file') {
    notes.push(rec.shared
      ? '这个文件是 Claude 在工作目录里写好后直接发给你的。'
      : '这个文件写进了 Claude 的工作目录，没有直接发给你；内容由工具调用重建。');
    if (rec.partial) notes.push('部分后续修改无法复原。');
  }
  return notes.join(' ');
}

function panelBody(rec, tab) {
  if (!rec || typeof rec.body !== 'string' || !rec.body) {
    return statePanel({ title: '没有内容', body: '这个产物的正文没有保存在导出里。' });
  }
  if (rec.format === 'html') {
    if (tab === 'source') return el('pre', { class: 'plain', html: highlight(rec.body, 'html') ?? '' });
    const frame = el('iframe', { sandbox: 'allow-scripts', title: rec.title });
    frame.srcdoc = rec.body;
    return frame;
  }
  if (rec.format === 'markdown') return el('div', { class: 'md', html: renderMarkdown(rec.body) });
  const hi = rec.lang ? highlight(rec.body, rec.lang) : null;
  if (hi) return el('pre', { class: 'plain', html: hi });
  return el('pre', { class: 'plain', text: rec.body });
}

function renderPanel() {
  const panel = $('#panel');
  const p = state.panel;
  $('.app').dataset.panel = p ? 'open' : 'closed';
  panel.hidden = !p;
  if (!p) return;

  const rec = p.rec;
  const meta = rec || p.meta || {};
  const convName = (p.convId && state.byId.get(p.convId)?.name) || p.meta?.convName || '';
  const conv = p.convId ? state.byId.get(p.convId) : null;

  $('#panel-kind').textContent = meta.kind === 'file' ? formatLabel(meta) : (KIND_LABEL[meta.kind] || '产物');
  $('#panel-kind').dataset.kind = meta.kind || '';
  $('#panel-title').textContent = meta.title || '产物';
  $('#panel-meta').textContent = [
    meta.bytes ? fmt.bytes(meta.bytes) : (p.loading ? '正在重建…' : ''),
    sourceLabel(meta, rec),
    commentCount(meta) ? `${commentCount(meta)} 条评论` : '',
    convName ? `来自「${convName}」` : '',
  ].filter(Boolean).join(' · ');

  $('#panel-actions').replaceChildren(
    rec?.body ? copyButton(() => rec.body, { label: '复制', class: 'text-btn', title: '复制全部内容' }) : null,
    rec?.body ? el('button', {
      class: 'text-btn',
      text: '下载',
      title: `下载为 ${fileNameFor(rec)}`,
      onClick: () => downloadText(fileNameFor(rec), rec.body),
    }) : null,
    conv ? el('button', { class: 'text-btn', text: '打开对话', onClick: () => { location.hash = `#/c/${conv.id}`; } }) : null,
    el('button', { class: 'icon-btn', title: '关闭', 'aria-label': '关闭产物面板', html: ICON.close, onClick: closePanel })
  );

  const tabs = $('#panel-tabs');
  if (rec && rec.format === 'html' && rec.body) {
    tabs.hidden = false;
    tabs.replaceChildren(
      ...[['preview', '预览'], ['source', '源码']].map(([id, label]) =>
        el('button', {
          class: 'chip',
          'aria-pressed': (p.tab || 'preview') === id ? 'true' : 'false',
          text: label,
          onClick: () => { state.panel.tab = id; renderPanel(); },
        }))
    );
  } else {
    tabs.hidden = true;
    tabs.replaceChildren();
  }

  if (p.loading) {
    $('#panel-body').replaceChildren(el('div', { class: 'skeleton' },
      el('div', { class: 'sk-line' }), el('div', { class: 'sk-line' }), el('div', { class: 'sk-line' })));
  } else if (p.error) {
    $('#panel-body').replaceChildren(statePanel({
      title: '无法打开这个产物',
      body: p.error,
      action: { label: '重试', fn: () => openArtifact(p.meta) },
    }));
  } else {
    $('#panel-body').replaceChildren(panelBody(rec, p.tab));
    // Comments from the exported page, when we have them.
    if (Array.isArray(rec?.comments) && rec.comments.length) {
      $('#panel-body').append(
        el('div', { class: 'month', text: '文档里的评论' }),
        ...rec.comments.map((c) => el('blockquote', { class: 'md' },
          el('div', { text: c.body }),
          c.created_at ? el('div', { class: 'disc-note', text: c.created_at.slice(0, 16).replace('T', ' ') }) : null))
      );
    }
  }

  const foot = $('#panel-foot');
  const note = rec ? panelNote(rec) : '';
  foot.hidden = !note;
  foot.textContent = note;
}

// ---------------------------------------------------------------------------
// artifacts index view
// ---------------------------------------------------------------------------

const ART_FILTERS = [
  ['all', '全部', () => true],
  ['doc', '文档', (i) => i.kind !== 'attachment' && (i.kind === 'doc' || i.format === 'markdown')],
  ['code', '代码', (i) => i.kind !== 'attachment' && i.format === 'code'],
  ['web', '网页', (i) => i.kind !== 'attachment' && i.format === 'html'],
  ['attachment', '附件', (i) => i.kind === 'attachment'],
  ['file', '文件', (i) => i.kind === 'file'],
  ['shared', '已分享', (i) => i.kind === 'file' && i.shared],
];

function artRow(item) {
  return el('li', { class: 'row art-row' },
    el('button', { class: 'row-link', title: item.path || item.title, onClick: () => openArtifact(item) },
      el('span', { class: 'art-glyph', html: artGlyph(item) }),
      el('span', {},
        el('span', { class: 'row-name', text: item.title }),
        el('span', {
          class: 'row-preview',
          text: item.snippet
            || (item.path && item.path !== item.title ? item.path : formatLabel(item)),
        })
      ),
      el('span', { class: 'row-side' },
        el('span', { text: item.bytes ? fmt.bytes(item.bytes) : '' }),
        el('span', { text: (state.byId.get(item.conv)?.name || item.convName || '').slice(0, 20) })
      )
    )
  );
}

function renderArtifacts() {
  const data = state.artIndex;
  if (!data) {
    renderTopbar({ title: '全部产物', meta: '载入中…' });
    $('#thread').replaceChildren(el('div', { class: 'skeleton' },
      el('div', { class: 'sk-line' }), el('div', { class: 'sk-line' }), el('div', { class: 'sk-line' })));
    return;
  }
  const pred = (ART_FILTERS.find(([id]) => id === state.artFilter) || ART_FILTERS[0])[2];
  const counts = new Map(ART_FILTERS.map(([id, , p]) => [id, data.items.filter(p).length]));
  const list = data.items
    .filter(pred)
    .sort((a, b) => (b.convUpdated || '').localeCompare(a.convUpdated || ''));
  const shown = list.slice(0, state.rowLimits.artifacts);

  renderTopbar({ title: '全部产物', meta: `${fmt.num(counts.get('all'))} 项` });
  $('#thread').replaceChildren(
    el('div', { class: 'list-head' },
      el('span', { class: 'list-title', text: '全部产物' }),
      el('span', { class: 'list-note', text: `来自 ${fmt.num(data.stats.conversations)} 个对话` })
    ),
    el('div', { class: 'filters' }, ...ART_FILTERS.map(([id, label]) =>
      el('button', {
        class: 'chip',
        'aria-pressed': state.artFilter === id ? 'true' : 'false',
        text: `${label} ${fmt.num(counts.get(id))}`,
        onClick: () => { state.artFilter = id; state.rowLimits.artifacts = 200; renderArtifacts(); },
      }))),
    list.length
      ? el('ul', { class: 'rows rows-compact' }, ...shown.map(artRow))
      : statePanel({ title: '这一类里没有内容' }),
    list.length > shown.length
      ? el('button', {
        class: 'sb-more',
        style: 'margin-top:12px',
        text: `显示更多（还有 ${fmt.num(list.length - shown.length)} 项）`,
        onClick: () => { state.rowLimits.artifacts += 400; renderArtifacts(); },
      }) : null
  );
  $('#scroller').scrollTop = 0;
}

// ---------------------------------------------------------------------------
// main render + routing
// ---------------------------------------------------------------------------

function renderMain() {
  if (!state.index) return;
  const q = state.query.trim();
  if (state.searching && q) return renderResults();
  if (state.view.name === 'chat' && state.chat) return renderChat();
  if (state.view.name === 'artifacts') return renderArtifacts();
  if (state.view.name === 'all') return renderAll();
  return renderHome();
}

async function openChat(id) {
  const meta = state.byId.get(id);
  if (!meta) {
    state.chat = null;
    renderTopbar({ title: '找不到这段对话' });
    $('#thread').replaceChildren(statePanel({
      title: '找不到这段对话',
      body: '它可能不在这个导出里。',
      action: { label: '返回', fn: () => { location.hash = '#/'; } },
    }));
    return;
  }
  state.chat = null;
  renderTopbar({ title: meta.name, meta: '载入中…' });
  $('#thread').replaceChildren(el('div', { class: 'skeleton' },
    el('div', { class: 'sk-line' }), el('div', { class: 'sk-line' }),
    el('div', { class: 'sk-line' }), el('div', { class: 'sk-line' })));
  $('#rail').hidden = true;
  try {
    const [chat] = await Promise.all([loadChat(id), loadPages()]);
    if (location.hash !== `#/c/${id}`) return;  // navigated away while loading
    state.chat = chat;
    renderChat();
  } catch (e) {
    $('#thread').replaceChildren(statePanel({
      title: '无法载入这段对话',
      body: String(e.message || e),
      action: { label: '重试', fn: () => openChat(id) },
    }));
  }
}

function route() {
  state.searching = false;
  const hash = location.hash || '#/';
  const m = /^#\/c\/([0-9a-f-]+)$/i.exec(hash);
  if (m) {
    // A document belongs to its conversation; leaving that conversation closes it.
    if (state.panel && state.panel.convId !== m[1]) closePanel();
    state.view = { name: 'chat', id: m[1] };
    renderSidebar();
    openChat(m[1]);
    return;
  }
  if (hash === '#/all') {
    state.view = { name: 'all', id: null };
    renderSidebar();
    renderMain();
    $('#scroller').scrollTop = 0;
    return;
  }
  if (hash === '#/artifacts') {
    state.view = { name: 'artifacts', id: null };
    renderSidebar();
    renderMain();
    return;
  }
  state.view = { name: 'home', id: null };
  renderSidebar();
  renderMain();
}

// ---------------------------------------------------------------------------
// events
// ---------------------------------------------------------------------------

function wire() {
  const scroller = $('#scroller');
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateThumb();
    });
  };
  scroller.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { buildRail(); });

  const rail = $('#rail');
  let dragging = false;
  rail.addEventListener('pointerdown', (e) => {
    dragging = true;
    rail.setPointerCapture(e.pointerId);
    railJump(e.clientY);
  });
  rail.addEventListener('pointermove', (e) => {
    if (dragging) railJump(e.clientY);
    else railTipShow(e.clientY);
  });
  rail.addEventListener('pointerup', (e) => { dragging = false; rail.releasePointerCapture(e.pointerId); });
  rail.addEventListener('pointerleave', () => { dragging = false; $('.rail-tip', rail).hidden = true; });

  $('#search').addEventListener('input', (e) => {
    if (e.target.value === state.query) return;
    setQuery(e.target.value);
  });
  $('#sb-collapse').addEventListener('click', () => setSidebar('closed'));
  $('#searchform').addEventListener('submit', (e) => {
    e.preventDefault();
    const first = state.results && state.results !== 'loading' ? state.results.rows[0] : null;
    if (first) location.hash = `#/c/${first.id}`;
    else if (!state.query.trim()) $('#search').focus();
  });
  $('#clear-search').addEventListener('click', () => {
    $('#search').value = '';
    setQuery('');
    $('#search').focus();
  });

  // Tapping the content behind an open overlay sidebar closes it — but not the
  // toolbar buttons, whose own click would otherwise be undone by this handler.
  $('.main').addEventListener('click', (e) => {
    if (!window.matchMedia('(max-width: 980px)').matches) return;
    if (prefs.sidebar !== 'open') return;
    if (e.target.closest('.controls')) return;
    prefs.sidebar = 'closed';
    $('.app').dataset.sidebar = 'closed';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.panel) { closePanel(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      $('#search').focus();
      $('#search').select();
    }
    if (e.key === 'Escape' && document.activeElement === $('#search')) {
      if (state.query) { $('#search').value = ''; setQuery(''); }
      else $('#search').blur();
    }
  });

  document.addEventListener('click', async (e) => {
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      const code = copy.closest('.md-code')?.querySelector('code')?.textContent || '';
      const ok = await copyText(code);
      copy.textContent = ok ? '已复制' : '复制失败';
      setTimeout(() => { copy.textContent = '复制'; }, 1400);
      return;
    }
    const link = e.target.closest('a[href^="#/"]');
    if (link) { e.preventDefault(); location.hash = link.getAttribute('href'); return; }
    // An artifact written inline in a message body: open it in the side panel, the way
    // claude.ai opened the card these came from.
    const card = e.target.closest('[data-artifact]');
    if (card && (e.target.closest('[data-open]') || e.target.closest('.md-art-title'))) {
      e.preventDefault();
      openArtifact({ key: card.dataset.artifact, conv: state.chat?.id });
    }
  });

  window.addEventListener('hashchange', route);
}

// ---------------------------------------------------------------------------

async function boot() {
  document.documentElement.dataset.theme = prefs.theme;
  // On a narrow window the sidebar is an overlay, so don't cover the content with it.
  if (window.matchMedia('(max-width: 980px)').matches) prefs.sidebar = 'closed';
  $('.app').dataset.sidebar = prefs.sidebar;
  $('.app').dataset.panel = 'closed';
  $('#panel').hidden = true;
  $('#logo-mark').innerHTML = ICON.logo;
  $('#sb-collapse').innerHTML = ICON.collapse;
  $('#banner-icon').innerHTML = ICON.info;
  $('#send-btn').innerHTML = ICON.arrow;
  $('#clear-search').innerHTML = ICON.close;
  $('#clear-search').hidden = true;
  wire();
  try {
    await loadIndex();
  } catch (e) {
    $('#thread').replaceChildren(statePanel({
      title: '找不到存档数据',
      body: '先构建一次数据，然后通过本地服务器打开这个页面。',
      code: 'node tools/build.mjs && node tools/serve.mjs --open',
    }));
    return;
  }
  // The artifact index and the exported pages are needed by search, the sidebar
  // count, and every document panel, so fetch them alongside the first view.
  loadArtIndex().then(() => { if (!state.query.trim()) renderSidebar(); }).catch(() => {});
  loadPages().catch(() => {});
  const stats = state.index.stats;
  const who = state.index.user?.name || '';
  $('#banner-text').replaceChildren(
    el('span', { class: 'banner-strong', text: '本地存档 · 只读' }),
    el('span', { class: 'banner-sep', text: ' · ' }),
    el('span', { text: `${who ? `${who} 的 ` : ''}claude.ai 导出 ${fmt.day(stats.firstDate)} 至 ${fmt.day(stats.lastDate)}` }),
    el('span', { class: 'banner-sep', text: ' · ' }),
    el('span', { text: '数据不离开这台设备' })
  );
  $('#foot-stats').textContent = `${fmt.num(stats.conversations)} 个对话 · ${fmt.num(stats.messages)} 条消息`;
  $('#search').placeholder = `搜索 ${fmt.num(stats.conversations)} 个对话，或直接提问…`;
  route();
}

boot();
