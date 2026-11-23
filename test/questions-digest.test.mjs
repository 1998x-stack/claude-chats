import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const OUT = 'web/data/qdigest';

test('--digest 产出 24 片，总数与口径一致', () => {
  execFileSync('node', ['tools/questions.mjs', '--digest'], { stdio: 'ignore' });
  const m = JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json'), 'utf8'));
  assert.equal(m.convs, 705);
  assert.equal(m.chunks, 24);
  assert.equal(m.sliceSize, 30);
  assert.equal(m.msgs, 1296);
  assert.equal(m.candidates.total, 1457);
  assert.equal(m.candidates.excludedEmptyNoAttachment, 10);
  assert.equal(m.candidates.excludedContinueLike, 151);
  assert.equal(m.files.length, 24);
  assert.equal(m.files[0], 'part-00.json');
  assert.equal(m.files[23], 'part-23.json');
});

test('切片内容自洽：对话总数等于 705，附件片段不超过 200 字', () => {
  const files = fs.readdirSync(OUT).filter((f) => f.startsWith('part-'));
  let convs = 0;
  let msgs = 0;
  for (const f of files) {
    const p = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
    assert.ok(Number.isInteger(p.chunk));
    convs += p.convs.length;
    for (const c of p.convs) {
      assert.ok(!('blocks' in c) && !('toolResults' in c));
      for (const mm of c.msgs) {
        msgs++;
        for (const a of mm.atts) assert.ok(a.snippet.length <= 201);
      }
    }
  }
  assert.equal(convs, 705);
  assert.equal(msgs, 1296);
});

test('零提问的对话仍占切片位置，结构不破', () => {
  const files = fs.readdirSync(OUT).filter((f) => f.startsWith('part-'));
  let withZero = 0;
  for (const f of files) {
    const p = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
    for (const c of p.convs) {
      assert.equal(typeof c.convId, 'string');
      assert.ok(c.convId.length > 0);
      assert.ok(Array.isArray(c.msgs));
      if (c.msgs.length === 0) withZero++;
    }
  }
  assert.ok(withZero > 0, '导出里的空对话应当仍然占据切片位置');
});

test('U+2028 不会破坏切片 JSON', () => {
  const files = fs.readdirSync(OUT).filter((f) => f.startsWith('part-'));
  let found = 0;
  for (const f of files) {
    const raw = fs.readFileSync(path.join(OUT, f), 'utf8');
    assert.ok(!/[\u2028\u2029]/.test(raw), `${f} 含裸行分隔符`);
    if (raw.includes('\\n')) found++;
  }
  assert.ok(found > 0);
});
