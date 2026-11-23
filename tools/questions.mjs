#!/usr/bin/env node
/**
 * Question gallery pipeline.
 *
 *   node tools/questions.mjs --digest      conversations -> web/data/qdigest/part-NN.json
 *   node tools/questions.mjs --check-work  validate qwork/part-NN.json
 *   node tools/questions.mjs --tags        tag frequencies from qwork/
 *   node tools/questions.mjs --merge       qwork/ -> web/data/questions.json
 *   node tools/questions.mjs --check       validate web/data/questions.json
 *
 * Pure logic lives in tools/questions-lib.mjs; this file is only I/O and CLI.
 * web/data is wiped by tools/build.mjs, so anything that cannot be recomputed
 * (the subagents' output) lives in qwork/ at the repo root instead.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isCandidate, partition, buildSlicePayload, clipSnippet, validateWork, shardFiles,
  validateModules, dedupeQuestions, assignModule, fillOrigins, validateQuestions,
} from './questions-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHATS = path.join(ROOT, 'web', 'data', 'chats');
const QDIGEST = path.join(ROOT, 'web', 'data', 'qdigest');
const QWORK = path.join(ROOT, 'qwork');
const QUESTIONS = path.join(ROOT, 'web', 'data', 'questions.json');

/** The export contains raw U+2028/U+2029, which are legal JSON but break line-based tools. */
const norm = (s) => String(s ?? '').replace(/[\u2028\u2029]/g, '\n');

const argNum = (name, dflt) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : dflt;
};

/** Every conversation file, in a stable order so the digest is reproducible. */
function readChats() {
  return fs.readdirSync(CHATS).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(CHATS, f), 'utf8')));
}

/**
 * One human message as the digest wants it, or null when it is not a candidate.
 * The digest and --check both go through here so they cannot disagree about
 * which messages count.
 */
function candidateOf(m) {
  const text = norm((m.blocks || []).filter((b) => b.k === 'text').map((b) => b.md).join('\n')).trim();
  const atts = (m.attachments || []).map((a) => ({
    name: a.name || '',
    chars: (a.text || '').length,
    snippet: clipSnippet(norm(a.text || ''), 160),
  }));
  if (!text && !atts.length) return null;
  if (!isCandidate({ text, atts })) return null;
  return { text, atts };
}

function digest() {
  // 20 conversations per slice keeps every part under the ~50KB single-read
  // limit even with Chinese text; the caps are bytes (see clipSnippet).
  const sliceSize = argNum('slice', 20);
  const maxText = argNum('maxtx', 600);
  const maxSummary = argNum('maxsum', 300);
  const maxAtt = argNum('maxatt', 160);
  const candidates = { total: 0, excludedEmptyNoAttachment: 0, excludedContinueLike: 0 };
  let msgs = 0;

  const convs = readChats().map((chat) => {
    const out = {
      convId: chat.id,
      name: chat.name || chat.displayName || '',
      date: String(chat.created || '').slice(0, 10),
      summary: clipSnippet(chat.summary || '', maxSummary),
      msgs: [],
    };
    for (const m of chat.messages || []) {
      if (m.sender !== 'human') continue;
      candidates.total++;
      const rawText = norm((m.blocks || []).filter((b) => b.k === 'text').map((b) => b.md).join('\n')).trim();
      if (!rawText && !(m.attachments || []).length) { candidates.excludedEmptyNoAttachment++; continue; }
      const c = candidateOf(m);
      if (!c) { candidates.excludedContinueLike++; continue; }
      msgs++;
      out.msgs.push({ id: m.id, ts: m.ts || '', text: clipSnippet(c.text, maxText), atts: c.atts });
    }
    return out;
  });

  const slices = partition(convs, sliceSize);
  fs.rmSync(QDIGEST, { recursive: true, force: true });
  fs.mkdirSync(QDIGEST, { recursive: true });
  const files = slices.map((group, i) => {
    const name = `part-${String(i).padStart(2, '0')}.json`;
    fs.writeFileSync(path.join(QDIGEST, name), JSON.stringify(buildSlicePayload(i, group)));
    return name;
  });

  const manifest = {
    builtAt: new Date().toISOString(),
    sliceSize,
    chunks: slices.length,
    convs: convs.length,
    msgs,
    candidates,
    files,
  };
  fs.writeFileSync(path.join(QDIGEST, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`-> ${path.relative(ROOT, QDIGEST)}`);
  console.log(`   conversations ${manifest.convs}  chunks ${manifest.chunks}  questions ${manifest.msgs}`);
  console.log(`   candidates ${candidates.total} − empty ${candidates.excludedEmptyNoAttachment} − continue ${candidates.excludedContinueLike}`);
}

const pad = (i) => String(i).padStart(2, '0');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Validate every subagent's output against the slice it was handed. */
function checkWork() {
  const manifest = readJson(path.join(QDIGEST, 'manifest.json'));
  const errors = [];
  let total = 0;
  const covered = new Set();
  const slices = [];

  for (let i = 0; i < manifest.chunks; i++) {
    const slice = readJson(path.join(QDIGEST, `part-${pad(i)}.json`));
    slices.push(slice);
    // A chunk is one file or several shards (see shardFiles).
    const shards = shardFiles(fs.readdirSync(QWORK), i);
    if (!shards.length) { errors.push(`缺 qwork/part-${pad(i)}.json`); continue; }
    for (const shard of shards) {
      let payload;
      try {
        payload = readJson(path.join(QWORK, shard));
      } catch (e) {
        errors.push(`qwork/${shard} 不是合法 JSON: ${e.message}`);
        continue;
      }
      const r = validateWork(payload, slice);
      if (!r.ok) errors.push(...r.errors.map((e) => `${shard}: ${e}`));
      total += (payload.questions || []).length;
      for (const q of payload.questions || []) {
        for (const id of q.msgIds || []) covered.add(`${q.convId}|${id}`);
      }
    }
  }

  let uncovered = 0;
  for (const slice of slices) {
    for (const c of slice.convs) for (const m of c.msgs) if (!covered.has(`${c.convId}|${m.id}`)) uncovered++;
  }

  if (errors.length) {
    for (const e of errors.slice(0, 40)) console.error(e);
    if (errors.length > 40) console.error(`…还有 ${errors.length - 40} 条`);
    console.error(`FAIL ${errors.length} 条错误`);
    process.exit(1);
  }
  console.log(`ok ${manifest.chunks} 片 / ${total} 条问题 / 未覆盖 ${uncovered}`);
}

/** Every extraction file, shards included, in a stable order. */
function workFiles() {
  return fs.readdirSync(QWORK).filter((f) => /^part-\d{2}(?:-[a-z0-9]+)?\.json$/.test(f)).sort();
}

/** Every question, in file order. */
function allQuestions() {
  const out = [];
  for (const f of workFiles()) {
    for (const q of readJson(path.join(QWORK, f)).questions || []) out.push(q);
  }
  return out;
}

/**
 * Tag frequencies as JSON on stdout — the clustering pass reads this to decide
 * the module table. Counts are exact (no case folding): synonym folding belongs
 * to the module table, where it is visible and reviewable.
 */
function tags() {
  const tally = new Map();
  for (const q of allQuestions()) {
    for (const t of q.tags || []) {
      const key = String(t).trim();
      if (key) tally.set(key, (tally.get(key) || 0) + 1);
    }
  }
  const rows = [...tally.entries()].map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  console.log(JSON.stringify(rows, null, 1));
}

/**
 * Build web/data/questions.json from qwork/: dedupe into one question per
 * repeated ask, restore each source's verbatim text from the chat files, and
 * assign the single module the question belongs to.
 */
function merge() {
  const modFile = readJson(path.join(QWORK, 'modules.json'));
  const vr = validateModules(modFile);
  if (!vr.ok) {
    console.error(vr.errors.slice(0, 20).join('\n'));
    console.error(`FAIL qwork/modules.json 不合格（${vr.errors.length} 条）`);
    process.exit(1);
  }

  const index = readJson(path.join(ROOT, 'web', 'data', 'index.json'));
  const meta = new Map((index.chats || []).map((c) => [c.id, c]));

  // Verbatim text for every human message, straight from the conversation file.
  const lookup = new Map();
  for (const chat of readChats()) {
    for (const m of chat.messages || []) {
      if (m.sender !== 'human') continue;
      const text = norm((m.blocks || []).filter((b) => b.k === 'text').map((b) => b.md).join('\n')).trim();
      lookup.set(`${chat.id}|${m.id}`, text);
    }
  }

  const input = allQuestions();
  const recs = input.map((q) => ({
    ...q,
    convName: meta.get(q.convId)?.name || '',
    date: String(meta.get(q.convId)?.created || '').slice(0, 10),
  }));
  const deduped = fillOrigins(dedupeQuestions(recs), lookup);
  const questions = deduped.map((q) => {
    const { module, subtags } = assignModule(q, modFile.modules);
    return { ...q, module, subtags };
  });

  const tally = new Map();
  for (const q of questions) tally.set(q.module, (tally.get(q.module) || 0) + 1);
  const data = {
    builtAt: new Date().toISOString(),
    counts: { input: input.length, merged: questions.length, modules: modFile.modules.length },
    modules: modFile.modules.map((m) => ({
      id: m.id, name: m.name, desc: m.desc, count: tally.get(m.id) || 0,
    })),
    questions,
  };

  // U+2028/2029 are legal in JSON but break line-based tools (see README).
  const json = JSON.stringify(data).replace(/[\u2028\u2029]/g, '\\n');
  fs.mkdirSync(path.dirname(QUESTIONS), { recursive: true });
  fs.writeFileSync(QUESTIONS, json);

  const merged = input.length - questions.length;
  console.log(`-> ${path.relative(ROOT, QUESTIONS)}`);
  console.log(`   ${input.length} 条提取 → 去重合并 ${merged} 条 → ${questions.length} 条问题`);
  const multi = questions.filter((q) => q.sources.length > 1).length;
  console.log(`   多来源问题 ${multi} · 模块 ${data.modules.length}`);
}

/**
 * Validate questions.json and check coverage against the conversation files.
 * Candidates are recomputed from web/data/chats rather than read from the
 * digest: tools/build.mjs deletes web/data, and chats are rebuilt every time.
 */
function check() {
  const data = readJson(QUESTIONS);
  const r = validateQuestions(data);
  if (!r.ok) {
    for (const e of r.errors.slice(0, 25)) console.error(e);
    console.error(`FAIL ${r.errors.length} 条错误`);
    process.exit(1);
  }

  const covered = new Set();
  for (const q of data.questions) {
    for (const s of q.sources || []) for (const id of s.msgIds || []) covered.add(`${s.convId}|${id}`);
  }
  let total = 0;
  let miss = 0;
  for (const chat of readChats()) {
    for (const m of chat.messages || []) {
      if (m.sender !== 'human' || !candidateOf(m)) continue;
      total++;
      if (!covered.has(`${chat.id}|${m.id}`)) miss++;
    }
  }
  const pct = total ? (total - miss) / total : 1;
  if (pct < 0.9) {
    console.error(`FAIL 覆盖率 ${(pct * 100).toFixed(1)}%（${miss}/${total} 条消息没有任何问题指向）`);
    process.exit(1);
  }
  const sum = data.modules.reduce((a, m) => a + m.count, 0);
  console.log(`ok ${data.questions.length} 条 / ${data.modules.length} 模块 / 覆盖 ${(pct * 100).toFixed(1)}%`);
  console.log(`   模块计数合计 ${sum} = 问题总数 ${data.questions.length}`);
}

const MODES = [['--digest', digest], ['--check-work', checkWork], ['--tags', tags], ['--merge', merge], ['--check', check]];
const mode = process.argv.slice(2).find((a) => MODES.some(([flag]) => flag === a));
if (!mode) {
  console.error(`usage: node tools/questions.mjs ${MODES.map(([f]) => f).join(' | ')}`);
  process.exit(2);
}
MODES.find(([f]) => f === mode)[1]();
