import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeStd, dedupeQuestions, assignModule, validateQuestions, fillOrigins } from '../tools/questions-lib.mjs';

const MODULES = [
  { id: 'code', name: '代码实现', desc: '', tags: ['Python', '重构'] },
  { id: 'doc', name: '文档写作', desc: '', tags: ['写作'] },
  { id: 'misc', name: '未分类', desc: '', tags: [] },
];
const rec = (over = {}) => ({
  convId: 'c1', convName: 'n', date: '2026-01-01', msgIds: ['m1'], subject: 's',
  std: '标准问题', orig: '原话', kinds: ['技术实现'], tags: ['Python'], hasAttachment: false, ...over,
});

test('normalizeStd 全角半角与标点归一', () => {
  assert.equal(normalizeStd('改进 A，重写！'), normalizeStd('改进A 重写'));
  assert.equal(normalizeStd('RAG 检索'), normalizeStd('rag检索'));
  assert.notEqual(normalizeStd('改进 A'), normalizeStd('改进 B'));
});

test('orig 相同则合并，sources 累积两条，原文都不丢', () => {
  const out = dedupeQuestions([rec(), rec({ convId: 'c2', convName: 'n2', msgIds: ['m9'] })]);
  assert.equal(out.length, 1);
  assert.equal(out[0].sources.length, 2);
  assert.deepEqual(out[0].sources.map((s) => s.convId).sort(), ['c1', 'c2']);
  assert.ok(out[0].sources.every((s) => s.orig === '原话' && s.msgIds.length === 1));
});

test('没有 orig 字段的记录不会被误并（提取产物就是这个形状）', () => {
  const out = dedupeQuestions([
    rec({ std: '把博客改造成 Apple 动态风格', orig: undefined }),
    rec({ convId: 'c2', msgIds: ['m2'], std: '为 Text2SQL 论文做调研并分类整理', orig: undefined }),
    rec({ convId: 'c3', msgIds: ['m3'], std: '实现语义分块类并支持超参数', orig: undefined }),
  ]);
  assert.equal(out.length, 3, '缺少 orig 时不应把不同的问题并成一条');
});

test('两条真正不同的问题不会被误并', () => {
  const out = dedupeQuestions([
    rec({ std: '改进 A 类的匹配逻辑', orig: '改进 A' }),
    rec({ convId: 'c2', msgIds: ['m2'], std: '改进 B 类的匹配逻辑', orig: '改进 B' }),
  ]);
  assert.equal(out.length, 2);
});

test('std 几乎相同也算同一条，但来源都留下', () => {
  const out = dedupeQuestions([
    rec({ std: '为职位描述抽取专业信息，输出匹配规则与评分', orig: 'a' }),
    rec({ convId: 'c2', msgIds: ['m2'], std: '为职位描述抽取专业信息，输出匹配规则与评分。', orig: 'b' }),
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].sources.length, 2);
});

test('同一对话里重复的 msgId 不产生重复 source', () => {
  const out = dedupeQuestions([rec(), rec({ msgIds: ['m1'] })]);
  assert.equal(out[0].sources.length, 1);
  assert.deepEqual(out[0].sources[0].msgIds, ['m1']);
});

test('主模块唯一、副标签最多 2 个、无命中落 misc', () => {
  assert.equal(assignModule({ tags: ['Python', '重构', '写作'] }, MODULES).module, 'code');
  assert.deepEqual(assignModule({ tags: ['Python', '重构', '写作'] }, MODULES).subtags, ['写作']);
  assert.equal(assignModule({ tags: ['无关'] }, MODULES).module, 'misc');
  assert.equal(assignModule({ tags: [] }, MODULES).module, 'misc');
  assert.ok(assignModule({ tags: ['写作', 'a', 'b', 'c'] }, MODULES).subtags.length <= 2);
});

test('并列命中取表序在前者', () => {
  const mods = [
    { id: 'first', name: '', desc: '', tags: ['x'] },
    { id: 'second', name: '', desc: '', tags: ['x'] },
  ];
  assert.equal(assignModule({ tags: ['x'] }, mods).module, 'first');
});

test('原文由 msgIds 从对话文件里逐字还原，不等子代理抄写', () => {
  const lookup = new Map([
    ['c1|m1', '原话一。\n第二行'],
    ['c1|m2', '原话二'],
  ]);
  const qs = [{
    std: 'x', subject: 's', kinds: [], tags: [], hasAttachment: false,
    sources: [
      { convId: 'c1', convName: 'n', date: 'd', msgIds: ['m1', 'm2'], orig: '' },
      { convId: 'c2', convName: 'n2', date: 'd', msgIds: ['mX'], orig: '' },
    ],
  }];
  fillOrigins(qs, lookup);
  assert.equal(qs[0].sources[0].orig, '原话一。\n第二行\n原话二');
  assert.equal(qs[0].sources[1].orig, '');
});

test('模块计数互不重叠且等于归属到它的条数', () => {
  const data = {
    counts: {},
    modules: [
      { id: 'a', name: 'A', desc: '', count: 1 },
      { id: 'misc', name: '未分类', desc: '', count: 0 },
    ],
    questions: [{
      id: 'q-0001', std: 'x', kinds: ['技术实现'], subject: 's', module: 'a', subtags: [], tags: [],
      hasAttachment: false, sources: [{ convId: 'c1', convName: 'n', date: 'd', msgIds: ['m1'], orig: 'o' }],
    }],
  };
  assert.equal(validateQuestions(data).ok, true);

  const badCount = structuredClone(data);
  badCount.modules[0].count = 2;
  assert.equal(validateQuestions(badCount).ok, false);

  const badModule = structuredClone(data);
  badModule.questions[0].module = 'nope';
  assert.equal(validateQuestions(badModule).ok, false);

  const badSources = structuredClone(data);
  badSources.questions[0].sources = [];
  assert.equal(validateQuestions(badSources).ok, false);

  const badKind = structuredClone(data);
  badKind.questions[0].kinds = ['瞎写'];
  assert.equal(validateQuestions(badKind).ok, false);

  const dupId = structuredClone(data);
  dupId.questions.push(structuredClone(data.questions[0]));
  dupId.modules[0].count = 2;
  assert.equal(validateQuestions(dupId).ok, false);
});

// --- integration: the real pipeline output (needs --merge to have run) ---

test('questions.json 合法、计数是分区、每条来源都有原文字段', () => {
  const data = JSON.parse(fs.readFileSync('web/data/questions.json', 'utf8'));
  assert.deepEqual(validateQuestions(data).errors, []);
  assert.equal(data.modules.reduce((a, m) => a + m.count, 0), data.questions.length);
  assert.equal(data.counts.merged, data.questions.length);
  assert.ok(data.questions.length > 500, `只有 ${data.questions.length} 条问题`);
  let refs = 0;
  for (const q of data.questions) {
    assert.ok(q.sources.length > 0, `${q.id} 没有来源`);
    for (const s of q.sources) {
      assert.equal(typeof s.orig, 'string');
      assert.ok(s.msgIds.length > 0);
      refs += s.msgIds.length;
    }
  }
  assert.ok(refs > data.questions.length, '应当有合并了多条消息的问题');
});

test('原文为空的必定是附件消息，且这类问题的标准问题不是空的', () => {
  const data = JSON.parse(fs.readFileSync('web/data/questions.json', 'utf8'));
  const blank = data.questions.filter((q) => q.sources.every((s) => !s.orig.trim()));
  assert.ok(blank.length > 0, '应当存在「只有附件、没有文字」的问题');
  for (const q of blank) {
    assert.equal(q.hasAttachment, true, `${q.id} 原文为空却不是附件消息`);
    assert.ok(q.std.trim().length > 0, `${q.id} 的标准问题是空的`);
  }
});

test('去重确实合并了重复提问，且原文一条都没丢', () => {
  const data = JSON.parse(fs.readFileSync('web/data/questions.json', 'utf8'));
  assert.ok(data.counts.input > data.counts.merged, '没有发生任何合并，去重可能没生效');
  const multi = data.questions.filter((q) => q.sources.length > 1);
  assert.ok(multi.length > 0, '没有多来源问题');
  for (const q of multi) {
    for (const s of q.sources) assert.equal(typeof s.orig, 'string');
  }
});
