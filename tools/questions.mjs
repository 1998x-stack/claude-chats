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
import { isCandidate, partition, buildSlicePayload, clipSnippet } from './questions-lib.mjs';

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
  const sliceSize = argNum('slice', 30);
  const candidates = { total: 0, excludedEmptyNoAttachment: 0, excludedContinueLike: 0 };
  let msgs = 0;

  const convs = readChats().map((chat) => {
    const out = {
      convId: chat.id,
      name: chat.name || chat.displayName || '',
      date: String(chat.created || '').slice(0, 10),
      summary: chat.summary || '',
      msgs: [],
    };
    for (const m of chat.messages || []) {
      if (m.sender !== 'human') continue;
      candidates.total++;
      const text = norm((m.blocks || []).filter((b) => b.k === 'text').map((b) => b.md).join('\n')).trim();
      const atts = (m.attachments || []).map((a) => ({
        name: a.name || '',
        chars: (a.text || '').length,
        snippet: clipSnippet(norm(a.text || '')),
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

const MODES = [['--digest', digest]];
const mode = process.argv.slice(2).find((a) => MODES.some(([flag]) => flag === a));
if (!mode) {
  console.error(`usage: node tools/questions.mjs ${MODES.map(([f]) => f).join(' | ')}`);
  process.exit(2);
}
MODES.find(([f]) => f === mode)[1]();
