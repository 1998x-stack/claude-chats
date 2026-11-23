import test from 'node:test';
import assert from 'node:assert/strict';
import { isCandidate, partition, buildSlicePayload, clipSnippet } from '../tools/questions-lib.mjs';

test('isCandidate 保留短消息与纯附件，排除 continue 类与空且无附件', () => {
  assert.equal(isCandidate({ text: 'fix the err', atts: [] }), true);
  assert.equal(isCandidate({ text: '', atts: [{ name: 'a.txt' }] }), true);
  assert.equal(isCandidate({ text: '', atts: [] }), false);
  assert.equal(isCandidate({ text: 'Continue', atts: [] }), false);
  assert.equal(isCandidate({ text: 'continue', atts: [{ name: 'a.txt' }] }), false);
});

test('partition 均分且不丢项、不产生空片', () => {
  assert.deepEqual(partition([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(partition([], 3), []);
});

test('clipSnippet 截断到 200 字并加省略号，短文本原样', () => {
  assert.equal(clipSnippet('abc'), 'abc');
  assert.equal(clipSnippet('x'.repeat(250)).length, 201);
  assert.equal(clipSnippet('x'.repeat(201)).length, 201);
  assert.equal(clipSnippet('x'.repeat(200)), 'x'.repeat(200));
});

test('buildSlicePayload 只带必要字段，不透出 blocks/toolResults', () => {
  const p = buildSlicePayload(0, [{
    convId: 'c1', name: 'n', date: '2026-01-01', summary: 's',
    msgs: [{ id: 'm1', ts: 't', text: 'hi', atts: [{ name: 'a.txt', chars: 3, snippet: 'abc' }] }],
  }]);
  assert.equal(p.chunk, 0);
  assert.deepEqual(Object.keys(p.convs[0]).sort(), ['convId', 'date', 'msgs', 'name', 'summary']);
  assert.deepEqual(Object.keys(p.convs[0].msgs[0]).sort(), ['atts', 'id', 'text', 'ts']);
});
