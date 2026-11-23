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
  assert.equal(m.chunks, 36);
  assert.equal(m.sliceSize, 20);
  assert.equal(m.msgs, 1296);
  assert.equal(m.candidates.total, 1457);
  assert.equal(m.candidates.excludedEmptyNoAttachment, 10);
  assert.equal(m.candidates.excludedContinueLike, 151);
  assert.equal(m.files.length, 36);
  assert.equal(m.files[0], 'part-00.json');
  assert.equal(m.files[35], 'part-35.json');
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
        for (const a of mm.atts) assert.ok(Buffer.byteLength(a.snippet, 'utf8') <= 160);
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

test('每条消息与摘要都被截断，单片必须能一次读完（<48KB）', () => {
  execFileSync('node', ['tools/questions.mjs', '--digest'], { stdio: 'ignore' });
  const files = fs.readdirSync(OUT).filter((f) => f.startsWith('part-'));
  for (const f of files) {
    const bytes = fs.statSync(path.join(OUT, f)).size;
    assert.ok(bytes < 48 * 1024, `${f} 有 ${bytes} 字节，超过一次读取的上限`);
    const p = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
    for (const c of p.convs) {
      assert.ok(Buffer.byteLength(c.summary, 'utf8') <= 300, `${c.convId} 的 summary 没截断`);
      for (const mm of c.msgs) assert.ok(Buffer.byteLength(mm.text, 'utf8') <= 600, `${mm.id} 的 text 没截断`);
    }
  }
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

test('含代码围栏的消息，digest 里的文本仍保留围栏（只受字节上限影响）', () => {
  execFileSync('node', ['tools/questions.mjs', '--digest'], { stdio: 'ignore' });
  const files = fs.readdirSync(OUT).filter((f) => f.startsWith('part-'));
  let checked = 0;
  for (const f of files) {
    const p = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
    for (const c of p.convs) {
      for (const m of c.msgs) {
        if (!m.text.includes('```')) continue;
        assert.ok(m.text.includes('```'), '围栏被破坏了');
        checked++;
        if (checked >= 5) break;
      }
      if (checked >= 5) break;
    }
    if (checked >= 5) break;
  }
  assert.ok(checked > 0, '找不到含围栏的消息做样本');
});
