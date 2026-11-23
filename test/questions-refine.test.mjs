import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { needsRefinement, sliceByBytes, applyRefinements, stdLimit, hasHtml } from '../web/questions-lib.mjs';

const B = (s) => Buffer.byteLength(s, 'utf8');
const q = (over = {}) => ({
  id: 'q-0001', std: '实现语义分块类。', subject: '语义分块',
  kinds: ['技术实现'], tags: ['分块'], module: 'rag', subtags: [],
  sources: [{ convId: 'c1', msgIds: ['m1'], orig: '实现语义分块类。' }],
  ...over,
});

test('needsRefinement：悬空指代或来源被截断才算', () => {
  assert.equal(needsRefinement(q()), false);
  assert.equal(needsRefinement(q({ std: '基于上述调研结果写一份报告。' })), true);
  assert.equal(needsRefinement(q({ std: '复查前面那套代码并改进。' })), true);
  assert.equal(needsRefinement(q({ std: '为该项目补充 README。' })), true);
  assert.equal(needsRefinement(q({ std: '为新项目补充 README。' })), false);
  // a source longer than the 600-byte digest cap: the extractor never saw it all
  assert.equal(needsRefinement(q({
    sources: [{ convId: 'c1', msgIds: ['m1'], orig: 'x'.repeat(700) }],
  })), true);
  // 150 个汉字 = 450 字节，没到 600 字节上限，提取器看全了，不需要补
  assert.equal(needsRefinement(q({
    sources: [{ convId: 'c1', msgIds: ['m1'], orig: '中'.repeat(150) }],
  })), false);
});

test('sliceByBytes 按字节打包，不超上限也不丢记录、不打乱顺序', () => {
  const recs = Array.from({ length: 10 }, (_, i) => ({ id: `q-${i}`, pad: 'x'.repeat(1000) }));
  const slices = sliceByBytes(recs, 3000);
  for (const s of slices) {
    assert.ok(B(JSON.stringify(s)) <= 3200, `切片 ${B(JSON.stringify(s))} 字节，超了`);
  }
  assert.deepEqual(slices.flat().map((r) => r.id), recs.map((r) => r.id));
  assert.deepEqual(sliceByBytes([], 100), []);
});

test('sliceByBytes：单条超过上限时自成一片，不会被丢弃', () => {
  const slices = sliceByBytes([{ id: 'big', pad: 'x'.repeat(5000) }], 1000);
  assert.equal(slices.length, 1);
  assert.equal(slices[0][0].id, 'big');
});

test('applyRefinements 只改 std/subject，其余原样不动', () => {
  const before = [q(), q({ id: 'q-0002', std: '另一条问题。' })];
  const frozen = JSON.stringify(before);
  const out = applyRefinements(before, [
    { id: 'q-0001', std: '实现 SemanticChunk 类，支持用超参数控制语义分块行为。', subject: '语义分块类实现' },
  ]);
  assert.deepEqual(out.errors, []);
  assert.equal(out.applied.length, 1);
  assert.equal(out.next[0].std, '实现 SemanticChunk 类，支持用超参数控制语义分块行为。');
  assert.equal(out.next[0].subject, '语义分块类实现');
  // sources / tags / kinds / module / id 原样
  assert.deepEqual(out.next[0].sources, before[0].sources);
  assert.deepEqual(out.next[0].tags, before[0].tags);
  assert.deepEqual(out.next[0].kinds, before[0].kinds);
  assert.equal(out.next[0].module, before[0].module);
  assert.equal(out.next[1], before[1], '未涉及的问题不该被重建');
  assert.equal(JSON.stringify(before), frozen, '入参不该被就地修改');
});

test('applyRefinements 拒绝未知 id、空 std、超长、含 HTML', () => {
  // one bad record per id, so each rule is exercised on its own
  const many = [q(), q({ id: 'q-0002' }), q({ id: 'q-0003' }), q({ id: 'q-0004' })];
  const out = applyRefinements(many, [
    { id: 'q-9999', std: '不存在的 id。' },
    { id: 'q-0001', std: '   ' },
    { id: 'q-0002', std: '很长。'.repeat(60) },
    { id: 'q-0003', std: '<b>加粗</b>的问题。' },
  ]);
  assert.equal(out.errors.length, 4, `期望 4 条错误，实际：${out.errors.join(' | ')}`);
  assert.equal(out.applied.length, 0);
  assert.ok(out.errors.some((e) => e.includes('q-9999')));
  assert.ok(out.errors.some((e) => e.includes('长度')));
  assert.ok(out.errors.some((e) => e.includes('HTML')) || out.errors.some((e) => e.includes('标签')));
});

test('applyRefinements：同一 id 出现两次算错', () => {
  const out = applyRefinements([q()], [
    { id: 'q-0001', std: '第一次改写。' },
    { id: 'q-0001', std: '第二次改写。' },
  ]);
  assert.equal(out.errors.length, 1);
  assert.ok(out.errors[0].includes('重复'));
});

test('真实数据：目标集合是悬空指代与被截断来源的并集', () => {
  const data = JSON.parse(fs.readFileSync('web/data/questions.json', 'utf8'));
  const target = data.questions.filter(needsRefinement);
  assert.ok(target.length > 300 && target.length < 922, `目标数异常：${target.length}`);
  for (const t of target) assert.ok(needsRefinement(t));
  const untouched = data.questions.filter((x) => !needsRefinement(x));
  assert.ok(untouched.length > 400, '剩下的应该还有相当数量不需要改');
  for (const u of untouched) assert.equal(needsRefinement(u), false);
});

test('stdLimit 按语言给额度：中文 120 字，英文 240 字符', () => {
  assert.equal(stdLimit('改进知识图谱问答提示词，保留意图分类与字段规则。'), 120);
  assert.equal(stdLimit('Build an Apple-style website that breaks a task into nested subtasks.'), 240);
  assert.equal(stdLimit('用 Python 实现表格解析函数，输入文件路径并输出嵌套 JSON 结构。'), 120,
    '含中文就是中文问题，即便嵌了很多英文标识符也按 120 算');
});

test('applyRefinements 用按语言的额度判定长度', () => {
  const en = q({ id: 'q-0002', std: 'Short one.' });
  const longEn = 'Build an Apple-style website that breaks a task into nested subtasks, each both a numbered list and a todo list with checkbox strikethrough, plus a toggle list for sub-subtasks, with priority order.';
  assert.ok(longEn.length > 120 && longEn.length <= 240, `样本长度 ${longEn.length} 不在 120-240 之间`);
  const ok = applyRefinements([en], [{ id: 'q-0002', std: longEn }]);
  assert.deepEqual(ok.errors, [], '英文 240 字以内应当被接受');
  const tooLong = applyRefinements([en], [{ id: 'q-0002', std: `${longEn}${longEn}` }]);
  assert.equal(tooLong.errors.length, 1, '英文超过 240 仍应被拒');
  // 中文仍然卡 120
  const cn = applyRefinements([q()], [{ id: 'q-0001', std: '中'.repeat(150) }]);
  assert.equal(cn.errors.length, 1);
  assert.ok(cn.errors[0].includes('120'));
});

test('占位符 <structure> 不算 HTML，真标签仍被拒', () => {
  assert.equal(hasHtml('按给定的 <structure> 改进提示词。'), false, '原文里就是这么写的占位符');
  assert.equal(hasHtml('输出 <div> 结构。'), true);
  assert.equal(hasHtml('用 </antArtifact> 结束。'), true);
  assert.equal(hasHtml('<img src="x.png">'), true);
  assert.equal(hasHtml('<br/>'), true);
  assert.equal(hasHtml('<h1>标题</h1>'), true);
  assert.equal(hasHtml('输出 <pre> 块。'), true, '裸的已知标签名仍是标记');
  assert.equal(hasHtml('<paste.txt> 文件'), false, '非 HTML 标签名的占位符仍放行');
  const kept = applyRefinements([q()], [{ id: 'q-0001', std: '按给定的 <structure>（Role、Goals）改进提示词。' }]);
  assert.deepEqual(kept.errors, [], '<structure> 不应让整批作废');
});
