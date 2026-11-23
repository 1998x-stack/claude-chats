import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { KINDS, QUESTION_FIELDS } from '../tools/questions-lib.mjs';

const prompt = fs.readFileSync('tools/qextract-prompt.md', 'utf8');

test('提示词列出全部 kind 与全部必填字段', () => {
  for (const k of KINDS) assert.ok(prompt.includes(k), `缺少 kind: ${k}`);
  for (const f of QUESTION_FIELDS) assert.ok(prompt.includes(f), `缺少字段: ${f}`);
});

test('提示词含两个占位符与改写规则要点', () => {
  assert.ok(prompt.includes('{{CHUNK_FILE}}'));
  assert.ok(prompt.includes('{{OUT_FILE}}'));
  for (const s of ['artifact', '你现在是', '自洽', '逐字']) assert.ok(prompt.includes(s), `缺少要点: ${s}`);
});

test('KINDS 与 QUESTION_FIELDS 是稳定枚举，无重复', () => {
  assert.equal(KINDS.length, 10);
  assert.equal(new Set(KINDS).size, KINDS.length);
  assert.deepEqual([...QUESTION_FIELDS].sort(), [
    'convId', 'hasAttachment', 'kinds', 'msgIds', 'orig', 'std', 'subject', 'tags',
  ]);
});
