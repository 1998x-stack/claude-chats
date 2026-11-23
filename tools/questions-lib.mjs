/**
 * Pure helpers for the question gallery. No disk access, no node built-ins, so
 * every function here is unit-testable without the 705-conversation corpus.
 *
 * The pipeline is: --digest slices conversations into per-chunk JSON for the
 * extraction subagents; --merge turns their output into web/data/questions.json.
 * The candidate rule lives here because both the digest and --check must agree
 * on what counts as a question.
 */

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
  if (Buffer.byteLength(s, 'utf8') <= maxBytes) return s;
  const room = maxBytes - Buffer.byteLength('…', 'utf8');
  let out = '';
  let used = 0;
  for (const ch of s) {
    const b = Buffer.byteLength(ch, 'utf8');
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
 * Two records are the same question when their `orig` normalizes identically or
 * their `std` is at least SIM_THRESHOLD similar. Nothing is ever dropped: each
 * source keeps its conversation, its message ids and its verbatim text, because
 * "原文永远可见" is the point of the gallery.
 *
 * @param {object[]} recs extraction records joined with convName/date
 * @returns {object[]} questions with `sources[]`, ids assigned in input order
 */
export function dedupeQuestions(recs) {
  const out = [];
  for (const r of recs || []) {
    const origKey = normalizeStd(r.orig);
    let q = out.find((c) => c.origKey === origKey || similarity(c.std, r.std) >= SIM_THRESHOLD);
    if (!q) {
      q = {
        id: `q-${String(out.length + 1).padStart(4, '0')}`,
        std: r.std || '',
        subject: r.subject || '',
        kinds: [...(r.kinds || [])],
        tags: [...(r.tags || [])],
        hasAttachment: !!r.hasAttachment,
        sources: [],
        origKey,
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
  for (const q of out) delete q.origKey;
  return out;
}

/** Case/width-insensitive tag key, so `Python` and `python` are the same tag. */
const tagKey = (t) => String(t ?? '')
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
