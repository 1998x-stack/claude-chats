import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWork, shardFiles } from '../web/questions-lib.mjs';

const slice = { chunk: 0, convs: [{ convId: 'c1', msgs: [{ id: 'm1' }, { id: 'm2' }] }] };
const q = {
  convId: 'c1', msgIds: ['m1'], subject: 's', std: '标准问题', orig: '原话',
  kinds: ['技术实现'], tags: ['a', 'b'], hasAttachment: false,
};
const wrap = (...questions) => ({ chunk: 0, questions });

test('合法输出通过', () => {
  assert.equal(validateWork(wrap(q), slice).ok, true);
});

test('片号不符 / 未知 convId / 未知 msgId / 未知 kind / 空 std 都失败', () => {
  assert.equal(validateWork({ chunk: 9, questions: [q] }, slice).ok, false);
  assert.equal(validateWork(wrap({ ...q, convId: 'zz' }), slice).ok, false);
  assert.equal(validateWork(wrap({ ...q, msgIds: ['nope'] }), slice).ok, false);
  assert.equal(validateWork(wrap({ ...q, kinds: ['瞎写'] }), slice).ok, false);
  assert.equal(validateWork(wrap({ ...q, std: '  ' }), slice).ok, false);
  assert.equal(validateWork(wrap({ ...q, msgIds: [] }), slice).ok, false);
  assert.equal(validateWork('/', slice).ok, false);
});

test('完全重复的记录被拒；同一消息拆成两个不同问题是允许的', () => {
  assert.equal(validateWork(wrap(q, { ...q }), slice).ok, false);
  assert.equal(validateWork(wrap(q, { ...q, subject: 'y', std: '另一个问题' }), slice).ok, true);
});

test('U+2028 与超长字段不破坏校验', () => {
  assert.equal(validateWork(wrap({ ...q, std: 'a\u2028b', tags: Array(20).fill('t') }), slice).ok, true);
});

test('不再要求 orig（原文由合并阶段还原），但仍要求 std 与 msgIds', () => {
  const noOrig = { ...q };
  delete noOrig.orig;
  assert.equal(validateWork(wrap(noOrig), slice).ok, true);
  assert.equal(validateWork(wrap({ ...q, std: '' }), slice).ok, false);
});

test('hasAttachment 必须是布尔', () => {
  assert.equal(validateWork(wrap({ ...q, hasAttachment: 'true' }), slice).ok, false);
});

test('shardFiles 把 part-20 的各分片都算作 chunk 20，不会误吞 part-2', () => {
  const files = ['part-02.json', 'part-20.json', 'part-20-a.json', 'part-20-b.json', 'part-21.json', 'manifest.json'];
  assert.deepEqual(shardFiles(files, 20), ['part-20-a.json', 'part-20-b.json', 'part-20.json']);
  assert.deepEqual(shardFiles(files, 2), ['part-02.json']);
  assert.deepEqual(shardFiles(files, 21), ['part-21.json']);
  assert.deepEqual(shardFiles(files, 7), []);
});
