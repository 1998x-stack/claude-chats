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
import { isCandidate, partition, buildSlicePayload, clipSnippet, validateWork, shardFiles } from './questions-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHATS = path.join(ROOT, 'web', 'data', 'chats');
const QDIGEST = path.join(ROOT, 'web', 'data', 'qdigest');
const QWORK = path.join(ROOT, 'qwork');

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
      const full = norm((m.blocks || []).filter((b) => b.k === 'text').map((b) => b.md).join('\n')).trim();
      const text = clipSnippet(full, maxText);
      const atts = (m.attachments || []).map((a) => ({
        name: a.name || '',
        chars: (a.text || '').length,
        snippet: clipSnippet(norm(a.text || ''), maxAtt),
      }));
      if (!text && !atts.length) { candidates.excludedEmptyNoAttachment++; continue; }
      if (!isCandidate({ text, atts })) { candidates.excludedContinueLike++; continue; }
      msgs++;
      out.msgs.push({ id: m.id, ts: m.ts || '', text, atts });
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

const MODES = [['--digest', digest], ['--check-work', checkWork]];
const mode = process.argv.slice(2).find((a) => MODES.some(([flag]) => flag === a));
if (!mode) {
  console.error(`usage: node tools/questions.mjs ${MODES.map(([f]) => f).join(' | ')}`);
  process.exit(2);
}
MODES.find(([f]) => f === mode)[1]();
