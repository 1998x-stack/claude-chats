import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateModules, tagKey } from '../web/questions-lib.mjs';

// This one needs the clustering pass to have run (Task 5 Step 5).
test('modules.json 合法：10–16 项、id 唯一且为 slug、含未分类兜底', () => {
  const data = JSON.parse(fs.readFileSync('qwork/modules.json', 'utf8'));
  const r = validateModules(data);
  assert.deepEqual(r.errors, []);
  assert.ok(data.modules.length >= 10 && data.modules.length <= 16);
  assert.ok(data.modules.some((m) => m.id === 'misc'));
});

test('--tags 给出按频次降序的标签表，总数与 qwork 一致', () => {
  // counts are folded by tagKey (case/width/space), as the plan required
  const rows = JSON.parse(execFileSync('node', ['tools/questions.mjs', '--tags'], { encoding: 'utf8' }));
  assert.ok(rows.length > 100, `只有 ${rows.length} 个标签，太少了`);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].count >= rows[i].count, `第 ${i} 行没有按频次降序`);
  }
  let total = 0;
  const tally = new Map();
  for (const f of fs.readdirSync('qwork').filter((x) => x.startsWith('part-'))) {
    const pay = JSON.parse(fs.readFileSync(`qwork/${f}`, 'utf8'));
    for (const q of pay.questions || []) {
      for (const t of q.tags || []) {
        const key = tagKey(t);
        if (!key) continue;
        total++;
        tally.set(key, (tally.get(key) || 0) + 1);
      }
    }
  }
  assert.equal(rows.reduce((a, r) => a + r.count, 0), total);
  assert.equal(rows[0].count, Math.max(...tally.values()));
});

test('id 冲突、非 slug、空 tags 都被发现', () => {
  const bad = {
    modules: [
      { id: 'a', name: 'A', desc: '', tags: ['x'] },
      { id: 'a', name: 'B', desc: '', tags: [] },
      { id: 'Not A Slug', name: 'C', desc: '', tags: ['y'] },
      { id: 'd', name: '', desc: '', tags: ['z'] },
    ],
  };
  const r = validateModules(bad);
  assert.ok(r.errors.length >= 4, `期望至少 4 条错误，实际 ${r.errors.length}: ${r.errors.join('; ')}`);
});

test('缺 misc 兜底被发现', () => {
  const mods = Array.from({ length: 10 }, (_, i) => ({ id: `m${i}`, name: `M${i}`, desc: '', tags: [`t${i}`] }));
  assert.ok(validateModules({ modules: mods }).errors.some((e) => e.includes('misc')));
});

test('数量越界被发现', () => {
  const few = Array.from({ length: 3 }, (_, i) => ({ id: `m${i}`, name: `M${i}`, desc: '', tags: [`t${i}`] }));
  assert.ok(validateModules({ modules: [...few, { id: 'misc', name: '未分类', desc: '', tags: [] }] })
    .errors.some((e) => e.includes('10')));
});
