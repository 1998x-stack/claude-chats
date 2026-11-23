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
 * First `n` characters, with an ellipsis when cut. Used to give the extraction
 * subagents just enough of an attachment to name it in the question.
 * @param {string} text
 * @param {number} [n]
 * @returns {string}
 */
export function clipSnippet(text, n = 200) {
  const s = String(text ?? '');
  return s.length <= n ? s : `${s.slice(0, n)}…`;
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
