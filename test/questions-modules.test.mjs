import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateModules } from '../tools/questions-lib.mjs';

// This one needs the clustering pass to have run (Task 5 Step 5).
test('modules.json 合法：10–16 项、id 唯一且为 slug、含未分类兜底', () => {
  const data = JSON.parse(fs.readFileSync('qwork/modules.json', 'utf8'));
  const r = validateModules(data);
  assert.deepEqual(r.errors, []);
  assert.ok(data.modules.length >= 10 && data.modules.length <= 16);
  assert.ok(data.modules.some((m) => m.id === 'misc'));
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
