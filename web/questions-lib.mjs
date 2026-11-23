/**
 * Pure helpers for the question gallery, shared by the CLI (`tools/questions.mjs`)
 * and the browser (`web/app.js`) exactly as `artifacts.js` is — one implementation
 * of the rules that decide what a question is, so the two cannot disagree.
 *
 * No disk access and no imports at all, so every function here is unit-testable
 * without the 705-conversation corpus. `Buffer` is used when present and
 * `TextEncoder` otherwise, so the module also runs in a browser.
 *
 * The pipeline is: --digest slices conversations into per-chunk JSON for the
 * extraction subagents; --merge turns their output into web/data/questions.json.
 * The candidate rule lives here because both the digest and --check must agree
 * on what counts as a question.
 */

/** UTF-8 byte length, in Node and in the browser. */
const byteLen = (s) => (typeof Buffer !== 'undefined'
  ? Buffer.byteLength(s, 'utf8')
  : new TextEncoder().encode(s).length);

/** "continue"-style follow-ups carry no question of their own. */
export const CONTINUE_RE = /^(?:continue|继续|继续吧|go|next|ok|好的|好|嗯|yes|y|1|2)\.?$/i;

/**
 * Question type. Fixed so 24 independent extraction subagents stay consistent
 * and the merge validator can reject anything invented.
 */
export const KINDS = [
  '研究调研', '技术实现', '代码调试', '分析评估', '方案设计',
  '内容写作', '学习理解', '数据处理', '工具环境', '其他',
];

/**
 * Required fields on every extracted question. The prompt is tested against
 * this list so the instructions and the validator cannot drift apart.
 *
 * `orig` is deliberately NOT here. Asking a model to reproduce long verbatim
 * text is the thing it is worst at, and the first extraction attempt died on it.
 * Subagents point at messages by id; --merge restores the exact text from the
 * chat file, so "原文永远可见" holds by construction rather than by trust.
 * Conversation metadata (name, date) is absent for the same reason.
 */
export const QUESTION_FIELDS = [
  'convId', 'msgIds', 'subject', 'std', 'kinds', 'tags', 'hasAttachment',
];

/**
 * Does this human message carry something to turn into a question?
 * A message with no text still counts when it carries attachments: "here, look
 * at this" is a request (214 of them in this export). A bare "continue" never
 * counts, even with an attachment.
 * @param {{text?: string, atts?: {name?: string}[]}} msg
 * @returns {boolean}
 */
export function isCandidate(msg) {
  const text = (msg?.text || '').trim();
  const atts = msg?.atts || [];
  if (!text) return atts.length > 0;
  return !CONTINUE_RE.test(text);
}

/**
 * Split into consecutive groups of `size`, dropping nothing and never emitting
 * an empty group.
 * @template T
 * @param {T[]} items
 * @param {number} size
 * @returns {T[][]}
 */
export function partition(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Clip to at most `maxBytes` of UTF-8, with an ellipsis when cut.
 *
 * The unit is bytes, not characters, because the limit being respected is a
 * file-read limit: this corpus is Chinese, three bytes per character, and a
 * 600-character cap produced 69 KB slices that no subagent could read in one
 * call (the first extraction attempt paged them with `head -c` and died).
 * Never splits a character.
 * @param {string} text
 * @param {number} [maxBytes]
 * @returns {string}
 */
export function clipSnippet(text, maxBytes = 200) {
  const s = String(text ?? '');
  if (byteLen(s) <= maxBytes) return s;
  const room = maxBytes - byteLen('…');
  let out = '';
  let used = 0;
  for (const ch of s) {
    const b = byteLen(ch);
    if (used + b > room) break;
    out += ch;
    used += b;
  }
  return `${out}…`;
}

/**
 * One slice as written to web/data/qdigest/part-NN.json. Only the fields the
 * extraction prompt needs — listing them explicitly keeps the raw message
 * blocks and tool payloads out of the file.
 * @param {number} chunk
 * @param {Array} convs
 * @returns {{chunk: number, convs: object[]}}
 */
export function buildSlicePayload(chunk, convs) {
  return {
    chunk,
    convs: (convs || []).map((c) => ({
      convId: c.convId,
      name: c.name,
      date: c.date,
      summary: c.summary,
      msgs: (c.msgs || []).map((m) => ({
        id: m.id,
        ts: m.ts,
        text: m.text,
        atts: (m.atts || []).map((a) => ({ name: a.name, chars: a.chars, snippet: a.snippet })),
      })),
    })),
  };
}

/**
 * Two extracted records are the same thing when the conversation, the source
 * messages and the question text all match. Same message in two *different*
 * questions is legitimate (prompt rule 7 splits one message with two needs).
 */
const dupKeyOf = (q) =>
  `${q.convId}|${[...(q.msgIds || [])].sort().join(',')}|${String(q.std || '').replace(/\s+/g, '').trim()}`;

/**
 * Validate one subagent's output against the slice it was given.
 * @param {object} payload parsed qwork/part-NN.json
 * @param {{chunk: number, convs: {convId: string, msgs: {id: string}[]}[]}} slice the digest it came from
 * @returns {{ok: boolean, errors: string[]}}
 */
export function validateWork(payload, slice) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: ['输出不是 JSON 对象'] };
  }
  const errors = [];
  if (payload.chunk !== slice.chunk) errors.push(`chunk 不符: ${payload.chunk} != ${slice.chunk}`);
  if (!Array.isArray(payload.questions)) return { ok: false, errors: [...errors, 'questions 不是数组'] };

  const convById = new Map((slice.convs || []).map((c) => [c.convId, c]));
  const seen = new Map();

  payload.questions.forEach((q, i) => {
    if (!q || typeof q !== 'object') { errors.push(`Q${i} 不是对象`); return; }
    const at = `Q${i}(${q.convId || '?'})`;
    const conv = convById.get(q.convId);
    if (!conv) errors.push(`${at} convId 不在本片: ${q.convId}`);
    for (const f of ['std', 'subject']) {
      if (typeof q[f] !== 'string') errors.push(`${at} ${f} 不是字符串`);
      else if (f === 'std' && !q[f].trim()) errors.push(`${at} std 为空`);
    }
    // orig is optional: --merge restores it from the conversation file.
    if (q.orig !== undefined && typeof q.orig !== 'string') errors.push(`${at} orig 不是字符串`);
    if (!Array.isArray(q.msgIds) || !q.msgIds.length) {
      errors.push(`${at} msgIds 为空`);
    } else if (conv) {
      const known = new Set(conv.msgs.map((m) => m.id));
      for (const id of q.msgIds) if (!known.has(id)) errors.push(`${at} msgId 不在该对话: ${id}`);
    }
    if (!Array.isArray(q.kinds) || !q.kinds.length) errors.push(`${at} kinds 为空`);
    else for (const k of q.kinds) if (!KINDS.includes(k)) errors.push(`${at} 未知 kind: ${k}`);
    if (!Array.isArray(q.tags)) errors.push(`${at} tags 不是数组`);
    if (typeof q.hasAttachment !== 'boolean') errors.push(`${at} hasAttachment 不是布尔`);

    const key = dupKeyOf(q);
    if (seen.has(key)) errors.push(`${at} 与 Q${seen.get(key)} 完全重复`);
    else seen.set(key, i);
  });

  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// merge stage
// ---------------------------------------------------------------------------

/** Merge below this 3-gram similarity; anything more similar is treated as one question. */
export const SIM_THRESHOLD = 0.9;

/** Fold width, case and punctuation so two spellings of one question compare equal. */
export function normalizeStd(s) {
  return String(s ?? '')
    .replace(/[\uff01-\uff5e]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\u3000-\u303f]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '');
}

const grams = (s) => {
  const out = new Set();
  if (!s) return out;
  if (s.length <= 3) { out.add(s); return out; }
  for (let i = 0; i + 3 <= s.length; i++) out.add(s.slice(i, i + 3));
  return out;
};

/** 3-gram Jaccard coefficient of two normalized strings. */
export function similarity(a, b) {
  const A = grams(normalizeStd(a));
  const B = grams(normalizeStd(b));
  if (!A.size && !B.size) return 1;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / (A.size + B.size - inter);
}

/**
 * Collapse repeats into one question with every source kept.
 *
 * Two records are the same question when their `std` is at least SIM_THRESHOLD
 * similar. Nothing is ever dropped: each source keeps its conversation, its
 * message ids and (once fillOrigins has run) its verbatim text, because
 * "原文永远可见" is the point of the gallery.
 *
 * The comparison is on `std` alone. It must NOT look at `orig`: extraction
 * records carry no `orig` at all — the text is restored later by msgIds — so
 * keying on it made every record compare equal on the empty string and
 * collapsed all 926 questions into one.
 *
 * @param {object[]} recs extraction records joined with convName/date
 * @returns {object[]} questions with `sources[]`, ids assigned in input order
 */
export function dedupeQuestions(recs) {
  const out = [];
  for (const r of recs || []) {
    let q = out.find((c) => similarity(c.std, r.std) >= SIM_THRESHOLD);
    if (!q) {
      q = {
        id: `q-${String(out.length + 1).padStart(4, '0')}`,
        std: r.std || '',
        subject: r.subject || '',
        kinds: [...(r.kinds || [])],
        tags: [...(r.tags || [])],
        hasAttachment: !!r.hasAttachment,
        sources: [],
      };
      out.push(q);
    } else {
      for (const k of r.kinds || []) if (!q.kinds.includes(k)) q.kinds.push(k);
      for (const t of r.tags || []) if (!q.tags.includes(t)) q.tags.push(t);
      q.hasAttachment = q.hasAttachment || !!r.hasAttachment;
      if (!q.subject) q.subject = r.subject || '';
    }
    for (const id of r.msgIds || []) {
      const src = q.sources.find((s) => s.convId === r.convId);
      if (src) { if (!src.msgIds.includes(id)) src.msgIds.push(id); }
      else {
        q.sources.push({
          convId: r.convId,
          convName: r.convName ?? '',
          date: r.date ?? '',
          msgIds: [id],
          orig: r.orig ?? '',
        });
      }
    }
  }
  return out;
}

/** Case/width-insensitive tag key, so `Python` and `python` are the same tag. */
export const tagKey = (t) => String(t ?? '')
  .replace(/[\uff01-\uff5e]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
  .replace(/\s+/g, '')
  .toLowerCase();

/**
 * Pick the one module a question belongs to, plus at most two filter-only sub-tags.
 *
 * The primary module is the one whose tag list matches most of the question's
 * tags, ties going to the earlier entry in `modules`. No match lands in `misc`,
 * so module counts stay a partition of the questions and never overlap.
 *
 * @param {{tags?: string[]}} q
 * @param {{id: string, tags?: string[]}[]} modules ordered
 * @returns {{module: string, subtags: string[]}}
 */
export function assignModule(q, modules) {
  const list = modules || [];
  let best = null;
  let bestHits = 0;
  for (const m of list) {
    const keys = new Set((m.tags || []).map(tagKey));
    const hits = (q.tags || []).filter((t) => keys.has(tagKey(t))).length;
    if (hits > bestHits) { bestHits = hits; best = m; }
  }
  if (!best) best = list.find((m) => m.id === 'misc') || list[list.length - 1];
  if (!best) return { module: '', subtags: [] };
  const inModule = new Set((best.tags || []).map(tagKey));
  const subtags = (q.tags || []).filter((t) => !inModule.has(tagKey(t))).slice(0, 2);
  return { module: best.id, subtags };
}

/** Structural check on web/data/questions.json, including that counts are a partition. */
export function validateQuestions(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, errors: ['不是对象'] };
  const errors = [];
  if (!Array.isArray(data.modules)) errors.push('modules 不是数组');
  if (!Array.isArray(data.questions)) errors.push('questions 不是数组');
  if (errors.length) return { ok: false, errors };

  const moduleIds = new Set();
  for (const m of data.modules) {
    if (typeof m?.id !== 'string' || !m.id) errors.push('模块缺 id');
    else if (moduleIds.has(m.id)) errors.push(`模块 id 重复: ${m.id}`);
    else moduleIds.add(m.id);
    if (typeof m?.name !== 'string' || !m.name) errors.push(`模块 ${m?.id} 缺 name`);
    if (typeof m?.count !== 'number') errors.push(`模块 ${m?.id} 缺 count`);
  }

  const qids = new Set();
  const tally = new Map();
  for (const [i, q] of data.questions.entries()) {
    if (!q || typeof q !== 'object') { errors.push(`Q${i} 不是对象`); continue; }
    const at = q.id || `Q${i}`;
    if (typeof q.id !== 'string' || !q.id) errors.push(`Q${i} 缺 id`);
    else if (qids.has(q.id)) errors.push(`${at} id 重复`);
    else qids.add(q.id);

    if (!moduleIds.has(q.module)) errors.push(`${at} module 不在 modules 内: ${q.module}`);
    else tally.set(q.module, (tally.get(q.module) || 0) + 1);

    if (typeof q.std !== 'string' || !q.std.trim()) errors.push(`${at} std 为空`);
    if (!Array.isArray(q.subtags)) errors.push(`${at} subtags 不是数组`);
    if (!Array.isArray(q.kinds) || !q.kinds.length) errors.push(`${at} kinds 为空`);
    else for (const k of q.kinds) if (!KINDS.includes(k)) errors.push(`${at} 未知 kind: ${k}`);

    if (!Array.isArray(q.sources) || !q.sources.length) errors.push(`${at} sources 为空`);
    else for (const s of q.sources) {
      if (!s || typeof s.convId !== 'string' || !s.convId) errors.push(`${at} source 缺 convId`);
      if (!Array.isArray(s?.msgIds) || !s.msgIds.length) errors.push(`${at} source 缺 msgIds`);
      if (typeof s?.orig !== 'string') errors.push(`${at} source 缺 orig`);
    }
  }

  for (const m of data.modules) {
    const actual = tally.get(m.id) || 0;
    if (m.count !== actual) errors.push(`模块 ${m.id} count=${m.count} 但实际 ${actual}`);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Fill in each source's verbatim text from the conversation files, keyed
 * `${convId}|${msgId}`. A question's sources are joined in msgIds order with a
 * newline, so a multi-turn merge reads as the original exchange.
 * @param {object[]} questions
 * @param {Map<string,string>} lookup
 * @returns {object[]} the same array, mutated
 */
export function fillOrigins(questions, lookup) {
  for (const q of questions || []) {
    for (const src of q.sources || []) {
      src.orig = (src.msgIds || [])
        .map((id) => lookup.get(`${src.convId}|${id}`))
        .filter((t) => typeof t === 'string')
        .join('\n');
    }
  }
  return questions;
}

/** Module ids are slugs: they appear in the URL `#/questions/<id>`. */
const MODULE_ID_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Structural check on qwork/modules.json, the tag -> module table produced by
 * the clustering pass. Bounds are the spec's 10–16, and `misc` must exist so
 * every question has somewhere to land.
 */
export function validateModules(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, errors: ['不是对象'] };
  if (!Array.isArray(data.modules)) return { ok: false, errors: ['modules 不是数组'] };
  const errors = [];
  const modules = data.modules;
  if (modules.length < 10 || modules.length > 16) {
    errors.push(`模块数量 ${modules.length} 不在 10–16 之间`);
  }
  const ids = new Set();
  for (const m of modules) {
    const at = m?.id ?? '?';
    if (typeof m?.id !== 'string' || !MODULE_ID_RE.test(m.id)) errors.push(`模块 id 不是 slug: ${at}`);
    else if (ids.has(m.id)) errors.push(`模块 id 重复: ${at}`);
    else ids.add(m.id);
    if (typeof m?.name !== 'string' || !m.name.trim()) errors.push(`模块 ${at} 缺 name`);
    if (typeof m?.desc !== 'string') errors.push(`模块 ${at} 缺 desc`);
    // `misc` is the fallback precisely because it matches no tag.
    if (!Array.isArray(m?.tags)) errors.push(`模块 ${at} 的 tags 不是数组`);
    else if (!m.tags.length && m.id !== 'misc') errors.push(`模块 ${at} 的 tags 为空`);
  }
  if (!modules.some((m) => m?.id === 'misc')) errors.push('缺少 misc 兜底模块');
  return { ok: errors.length === 0, errors };
}

/**
 * Which files in qwork/ belong to chunk `i`.
 *
 * A chunk may be written as one file (`part-07.json`) or split into shards
 * (`part-07-a.json`, `part-07-b.json`) when its output would exceed the model's
 * response limit — an oversized chunk must be retryable without reshuffling the
 * digest. The 2-digit prefix keeps `part-2` from being read as `part-20`.
 * @param {string[]} files names in qwork/
 * @param {number} i chunk index
 * @returns {string[]} sorted shard names
 */
export function shardFiles(files, i) {
  const nn = String(i).padStart(2, '0');
  const re = new RegExp(`^part-${nn}(?:-[a-z0-9]+)?\\.json$`);
  return (files || []).filter((f) => re.test(f)).sort();
}

/**
 * Why a source has no verbatim text — or null when it has some.
 *
 * Both cases produce `orig === ''`, and they mean very different things: a
 * message that was only an attachment has no text to show, whereas an empty
 * string with no attachment means the msgId could not be resolved. The card
 * must not claim the second is the first.
 * @param {{hasAttachment?: boolean}} q
 * @param {{orig?: string}} src
 * @returns {'attachment'|'unresolved'|null}
 */
export function originNote(q, src) {
  if (String(src?.orig ?? '').trim()) return null;
  return q?.hasAttachment ? 'attachment' : 'unresolved';
}

/**
 * msgIds that do not resolve to a message in the conversation files. Every one
 * of these silently produces an empty `orig`, so --check treats the list as a
 * hard failure rather than letting the gallery mislabel the question.
 * @param {object[]} questions
 * @param {Map<string,string>} lookup keyed `${convId}|${msgId}`
 * @returns {string[]} the unresolved keys, in question order, deduplicated
 */
export function unresolvableMsgIds(questions, lookup) {
  const out = new Set();
  for (const q of questions || []) {
    for (const src of q.sources || []) {
      for (const id of src.msgIds || []) {
        const key = `${src.convId}|${id}`;
        if (!lookup.has(key)) out.add(key);
      }
    }
  }
  return [...out];
}

// ---------------------------------------------------------------------------
// refinement pass
// ---------------------------------------------------------------------------

/**
 * Wording that points at something only named inside the conversation. A
 * standard question has to stand alone, so these are the clearest signal that
 * the rewrite kept a reference instead of resolving it.
 */
const DANGLING_RE = new RegExp([
  '上述', '前述', '刚才', '此前',
  '前面(?:那|这|的)', '上面(?:的|那)',
  '(?<![应不])该(?=[^，。；]{0,10}(?:项目|系统|代码|文件|文档|方案|问题|数据|模型|函数|类|网站|脚本|内容|结果|表格))',
  '(?<!这)这个(?=[^，。；]{0,10}(?:项目|系统|代码|文件|文档|方案|问题|数据|模型|函数|类|网站|脚本|内容|结果|表格))',
  '此(?:项目|文件|代码|方案|系统|内容)',
].join('|'));

/** The digest cap a source was truncated at, in UTF-8 bytes. */
export const SOURCE_BYTE_LIMIT = 600;

/**
 * Does this question need a refinement pass?
 *
 * Two ways information goes missing. Either the wording still points at
 * something unnamed ("基于上述调研结果"), or the source is longer than the 600
 * bytes the extractor was shown — 42% of sources are, and on average the
 * extractors saw just 29% of the original text, so any detail below the cut
 * was invisible to them.
 * @param {{std?: string, sources?: {orig?: string}[]}} q
 * @returns {boolean}
 */
export function needsRefinement(q) {
  if (DANGLING_RE.test(String(q?.std ?? ''))) return true;
  return (q?.sources || []).some((s) => byteLen(String(s?.orig ?? '')) > SOURCE_BYTE_LIMIT);
}

/**
 * Whether text carries markup that should never reach a standard question.
 *
 * A bare placeholder such as `<structure>` is not markup: it is the literal
 * name the user wrote in their own prompt, and dropping it would lose meaning.
 * Markup proper — a closing tag, a self-closing tag, or a tag with attributes —
 * is still rejected.
 * @param {string} text
 * @returns {boolean}
 */
const HTML_TAGS = new Set([
  'a', 'b', 'blockquote', 'body', 'br', 'button', 'code', 'dd', 'div', 'dl', 'dt',
  'em', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
  'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'li',
  'main', 'nav', 'ol', 'p', 'pre', 'script', 'section', 'span', 'strong', 'style',
  'sub', 'sup', 'svg', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
]);

export function hasHtml(text) {
  const s = String(text ?? '');
  const tags = s.match(/<[^>]*>/g) || [];
  return tags.some((t) => {
    const bare = /^<([^<>]+)>$/.exec(t);
    // A bare word — no whitespace, no slash — is a placeholder the user wrote
    // (`<structure>`, `<paste.txt>`), not markup. Anything with attributes, a
    // closing slash, or a known element name is markup.
    const name = bare && !/[\s/]/.test(bare[1]) ? bare[1] : null;
    return name === null || HTML_TAGS.has(name);
  });
}

/**
 * How long a standard question may be, in characters.
 *
 * The unit is characters, but the information a character carries is not the
 * same in every script: 120 Chinese characters is a dense 1-2 sentences, while
 * 120 Latin characters is barely a clause. The limit is therefore per script —
 * 120 for a CJK-dominant question, 240 otherwise — so a question in English is
 * held to a comparable amount of content rather than a comparable glyph count.
 * @param {string} text
 * @returns {number}
 */
export function stdLimit(text) {
  const s = String(text ?? '');
  // A question containing any CJK is a Chinese question, even when it embeds
  // English identifiers: the allowance follows the language of the prose, not
  // a letter count that English terms would dominate.
  return /[\u3400-\u9fff\uf900-\ufaff]/.test(s) ? 120 : 240;
}

/**
 * Pack records into slices no larger than `maxBytes` of JSON, preserving order
 * and never dropping or splitting a record. Sizing by bytes rather than count
 * is what keeps every slice readable in one tool call: originals here run from
 * 40 bytes to 37 KB.
 * @template T
 * @param {T[]} records
 * @param {number} maxBytes
 * @returns {T[][]}
 */
export function sliceByBytes(records, maxBytes) {
  const slices = [];
  let cur = [];
  let size = 2; // the enclosing []
  for (const r of records) {
    const n = byteLen(JSON.stringify(r)) + 1; // + the comma
    if (cur.length && size + n > maxBytes) { slices.push(cur); cur = []; size = 2; }
    cur.push(r);
    size += n;
  }
  if (cur.length) slices.push(cur);
  return slices;
}

/**
 * Patch refined wording back onto the questions.
 *
 * Only `std` and `subject` may change. Sources, tags, kinds, module and id are
 * the pipeline's own bookkeeping — a rewrite touching them would invalidate the
 * coverage, the module partition and the gallery's links. Untouched questions
 * keep their identity, and the input array is never mutated.
 *
 * All-or-nothing: any error means nothing is applied, so a half-refined file
 * can never be written.
 * @param {object[]} questions
 * @param {{id: string, std: string, subject?: string, note?: string}[]} records
 * @param {{maxLen?: number}} [opts]
 * @returns {{next: object[], applied: object[], errors: string[]}}
 */
export function applyRefinements(questions, records, { maxLen = 0 } = {}) {
  const byId = new Map((questions || []).map((q) => [q.id, q]));
  const errors = [];
  const applied = [];
  const seen = new Set();

  for (const [i, r] of (records || []).entries()) {
    if (!r || typeof r.id !== 'string' || !r.id) { errors.push(`第 ${i} 条缺 id`); continue; }
    const at = r.id;
    if (seen.has(at)) { errors.push(`${at} 重复出现`); continue; }
    seen.add(at);
    const target = byId.get(at);
    if (!target) { errors.push(`${at} 在 questions.json 里不存在`); continue; }
    const std = String(r.std ?? '').trim();
    const subject = String(r.subject ?? '').trim();
    if (!std) { errors.push(`${at} std 为空`); continue; }
    const limit = maxLen || stdLimit(std);
    if (std.length > limit) errors.push(`${at} 长度 ${std.length} 超过 ${limit}`);
    if (hasHtml(std) || hasHtml(subject)) errors.push(`${at} 含 HTML 标签`);
    if (errors.length) continue;
    applied.push({ id: at, std, subject: subject || target.subject, note: r.note || '' });
  }

  if (errors.length) return { next: questions, applied: [], errors };
  const patch = new Map(applied.map((a) => [a.id, a]));
  const next = questions.map((q) => {
    const p = patch.get(q.id);
    return p ? { ...q, std: p.std, subject: p.subject } : q;
  });
  return { next, applied, errors: [] };
}
