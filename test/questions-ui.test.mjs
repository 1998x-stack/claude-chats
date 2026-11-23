import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { findChrome } from '../tools/chrome.mjs';

/**
 * These assert on the real DOM through tools/cdp.mjs, because the gallery is
 * only correct if it renders: counts on screen, one module's questions in that
 * module, and a readable card for a question whose original text is empty.
 */
const BASE = 'http://127.0.0.1:8787';
const DATA = JSON.parse(fs.readFileSync('web/data/questions.json', 'utf8'));

// These tests need a real browser. Without one they are unrunnable rather than
// failing, so they skip with a reason instead of turning CI red on a machine
// that simply has no Chrome (set CHROME_PATH to point at one).
const CHROME = findChrome();
const skip = CHROME ? false : 'no Chrome/Chromium found; set CHROME_PATH to run the UI tests';

async function probe(name, expr, wait = '3500') {
  return probeAt('', name, expr, wait);
}

/** `at` is the hash to load directly, so a cold load can be tested as such. */
async function probeAt(at, name, expr, wait = '3500') {
  const file = `/tmp/qprobe-${name}.js`;
  fs.writeFileSync(file, expr);
  const out = execFileSync('node', ['tools/cdp.mjs', `${BASE}/${at}`, file, '--wait', wait],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const text = out.trim();
  if (text.startsWith('ERR ')) throw new Error(`${name}: ${text}`);
  return JSON.parse(text);
}

test('总览列出全部模块卡片，计数之和等于问题总数', { skip }, async () => {
  const out = await probe('overview', `
    location.hash = '#/questions';
    await new Promise((r) => setTimeout(r, 1200));
    const cards = [...document.querySelectorAll('.q-module')];
    return {
      cards: cards.length,
      names: cards.slice(0, 3).map((c) => c.querySelector('.q-module-name')?.textContent || ''),
      sum: cards.reduce((a, c) => a + Number(c.dataset.count || 0), 0),
      title: document.querySelector('#thread')?.textContent?.slice(0, 40) || '',
    };`);
  assert.equal(out.cards, DATA.modules.length);
  assert.equal(out.sum, DATA.questions.length);
  assert.ok(out.names.every((n) => n.length > 0));
});

test('模块页只列该模块的问题，标准问题、原文与复制按钮都在', { skip }, async () => {
  const mod = DATA.modules.find((m) => m.count > 0);
  const out = await probe('module', `
    location.hash = '#/questions/${mod.id}';
    await new Promise((r) => setTimeout(r, 1200));
    const items = [...document.querySelectorAll('.q-item')];
    return {
      n: items.length,
      mismatch: items.filter((i) => i.dataset.module !== '${mod.id}').length,
      everyStd: items.every((i) => (i.querySelector('.q-std')?.textContent || '').trim().length > 0),
      // an attachment-only question shows a note where the quote would be
      everyQuote: items.every((i) => !!i.querySelector('.q-orig, .q-orig-note')),
      everyCopy: items.every((i) => !!i.querySelector('.q-foot button.act')),
    };`);
  assert.ok(out.n > 0, '模块页一个问题都没渲染');
  assert.ok(out.n <= mod.count, `渲染了 ${out.n} 个，超过该模块的 ${mod.count} 个`);
  assert.equal(out.mismatch, 0, '出现不属于该模块的问题');
  assert.equal(out.everyStd, true);
  assert.equal(out.everyQuote, true);
  assert.equal(out.everyCopy, true);
});

test('点「复制问题」复制到的正是这条标准问题', { skip }, async () => {
  const mod = DATA.modules.find((m) => m.count > 0);
  const out = await probe('copy', `
    location.hash = '#/questions/${mod.id}';
    await new Promise((r) => setTimeout(r, 1200));
    if (!navigator.clipboard) Object.defineProperty(navigator, 'clipboard', { value: {} });
    window.__copied = null;
    navigator.clipboard.writeText = async (t) => { window.__copied = t; };
    const item = document.querySelector('.q-item');
    const std = item.querySelector('.q-std').textContent;
    const btn = item.querySelector('.q-foot button.act');
    const label = btn.textContent;
    btn.click();
    await new Promise((r) => setTimeout(r, 400));
    return { copied: window.__copied, std, label, after: btn.textContent };
  `);
  assert.equal(out.label, '复制问题');
  assert.equal(out.copied, out.std, '复制到的内容与卡片上的标准问题不一致');
  assert.equal(out.after, '已复制');
});

test('原文为空的附件问题卡片可读，且不渲染成 HTML', { skip }, async () => {
  const blank = DATA.questions.find((q) => q.sources.every((s) => !s.orig.trim()) && q.hasAttachment);
  assert.ok(blank, '数据集里应当有「只有附件」的问题');
  const out = await probe('blank', `
    location.hash = '#/questions/${blank.module}';
    await new Promise((r) => setTimeout(r, 1200));
    const item = document.querySelector('.q-item[data-qid="${blank.id}"]');
    return {
      found: !!item,
      text: (item?.textContent || '').replace(/\\s+/g, ' ').slice(0, 120),
      hasNote: !!item?.querySelector('.q-orig-note'),
    };`);
  assert.equal(out.found, true);
  assert.equal(out.hasNote, true, '原文为空时要给出说明而不是空白');
  assert.ok(out.text.trim().length > 0);
});

test('原始提问里的 markdown 与标签按纯文本呈现，不渲染成 HTML', { skip }, async () => {
  // 142 originals contain markdown-looking text and 68 contain HTML-looking tags
  // (old <antArtifact> blocks). A quote has to stay a quote.
  const target = DATA.questions.find((q) => q.sources.some((s) => /\*\*|^\s*[-*] |<[a-z]+[ >]/m.test(s.orig)));
  assert.ok(target, '数据集里应当有含 markdown/标签的原文');
  const out = await probe('plaintext', `
    location.hash = '#/questions/${target.module}';
    await new Promise((r) => setTimeout(r, 1400));
    const item = document.querySelector('.q-item[data-qid="${target.id}"]');
    if (item) item.querySelector('details')?.setAttribute('open', '');
    const t = item?.querySelector('.q-orig-text');
    return {
      found: !!t,
      tagsInside: t ? t.querySelectorAll('*').length : -1,
      renderedStrong: t ? t.querySelectorAll('strong, em, table, a, code').length : -1,
      text: (t?.textContent || '').slice(0, 60),
    };`);
  assert.equal(out.found, true, '找不到原文节点');
  assert.equal(out.tagsInside, 0, '原文节点里不应该有子元素');
  assert.equal(out.renderedStrong, 0, '原文被当成 markdown 渲染了');
  assert.ok(out.text.length > 0);
});

test('不存在的模块不崩，页面没有横向溢出', { skip }, async () => {
  const out = await probe('missing', `
    location.hash = '#/questions/does-not-exist-at-all';
    await new Promise((r) => setTimeout(r, 1000));
    return {
      text: (document.querySelector('#thread')?.textContent || '').trim().slice(0, 60),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      modules: document.querySelectorAll('.q-module').length,
    };`);
  assert.equal(out.overflow, false);
  assert.ok(out.text.length > 0, '应当给出一个空状态而不是白屏');
});

test('来源对话链接指向 #/c/<convId>/m/<msgId>', { skip }, async () => {
  const mod = DATA.modules.find((m) => m.count > 0);
  const out = await probe('links', `
    location.hash = '#/questions/${mod.id}';
    await new Promise((r) => setTimeout(r, 1200));
    const links = [...document.querySelectorAll('.q-item a.q-src-link')].map((a) => a.getAttribute('href'));
    return { n: links.length, sample: links[0] || '', bad: links.filter((h) => !/^#\\/c\\/[0-9a-f-]+\\/m\\/[0-9a-f-]+$/.test(h)).length };`);
  assert.ok(out.n > 0, '问题卡片上应当有来源链接');
  assert.equal(out.bad, 0, `有 ${out.bad} 个来源链接格式不对`);
});

test('直接打开 #/questions 也会渲染出模块卡片（冷启动不再卡在骨架）', { skip }, async () => {
  const out = await probeAt('#/questions', 'cold', `
    await new Promise((r) => setTimeout(r, 1500));
    return {
      cards: document.querySelectorAll('.q-module').length,
      skeleton: document.querySelectorAll('#thread .skeleton').length,
      sidebar: (document.querySelector('.sidebar')?.textContent || '').includes('问题画廊'),
    };`);
  assert.equal(out.cards, DATA.modules.length, '冷启动没有渲染模块');
  assert.equal(out.skeleton, 0, '仍然卡在骨架占位');
  assert.equal(out.sidebar, true, '侧栏没有画廊入口');
});

test('模块内搜索会收窄结果，且不影响全局搜索', { skip }, async () => {
  const mod = DATA.modules.find((m) => m.count > 10);
  const needle = '论文';
  const expected = DATA.questions.filter((q) => q.module === mod.id
    && [q.std, q.subject, ...q.tags, ...q.sources.map((s) => s.orig)].join(' ').includes(needle)).length;
  assert.ok(expected > 0 && expected < mod.count, `样本不合适：${expected}/${mod.count}`);
  const out = await probe('search', `
    location.hash = '#/questions/${mod.id}';
    await new Promise((r) => setTimeout(r, 1300));
    const before = document.querySelectorAll('.q-item').length;
    const input = document.querySelector('.q-search');
    const found = !!input;
    if (input) {
      input.value = '${needle}';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await new Promise((r) => setTimeout(r, 400));
    return {
      found,
      before,
      after: document.querySelectorAll('.q-item').length,
      hitsAll: [...document.querySelectorAll('.q-item .q-std, .q-item .q-orig-text')]
        .every((e) => true),
      globalSearching: document.querySelector('.composer')?.getAttribute('data-search') || '',
      hash: location.hash,
    };`);
  assert.equal(out.found, true, '模块页没有搜索框');
  assert.ok(out.before > expected, '搜索前应当有更多结果');
  assert.equal(out.after, expected, `搜索结果数不对：期望 ${expected}，实际 ${out.after}`);
  assert.equal(out.hash, `#/questions/${mod.id}`, '搜索不该改变路由');
});

test('附件类问题有标记，且可以一键只看附件', { skip }, async () => {
  const mod = DATA.modules.find((m) => m.count > 5);
  const att = DATA.questions.filter((q) => q.module === mod.id && q.hasAttachment).length;
  assert.ok(att > 0, '这个模块里没有附件类问题，换一个模块做样本');
  const out = await probe('att', `
    location.hash = '#/questions/${mod.id}';
    await new Promise((r) => setTimeout(r, 1300));
    const badges = document.querySelectorAll('.q-item .q-att').length;
    const chip = [...document.querySelectorAll('.filters .chip')].find((c) => c.textContent.includes('附件'));
    const found = !!chip;
    if (chip) chip.click();
    await new Promise((r) => setTimeout(r, 400));
    const items = [...document.querySelectorAll('.q-item')];
    return {
      badges, found,
      after: items.length,
      allAtt: items.every((i) => !!i.querySelector('.q-att')),
    };`);
  assert.ok(out.badges > 0, '附件类问题没有标记');
  assert.equal(out.found, true, '没有「只看附件」的筛选');
  assert.equal(out.after, att, `筛选结果数不对：期望 ${att}，实际 ${out.after}`);
  assert.equal(out.allAtt, true, '筛选后出现了非附件问题');
});

test('跳转标记只应用一次，切换思考/工具不会把视野拽回锚点', { skip }, async () => {
  const src = DATA.questions[0].sources[0];
  const out = await probe('anchoronce', `
    location.hash = '#/c/${src.convId}/m/${src.msgIds[0]}';
    await new Promise((r) => setTimeout(r, 2200));
    const applied = document.querySelectorAll('.msg[data-anchored]').length;
    const chip = [...document.querySelectorAll('.chip')].find((c) => c.textContent.includes('思考'));
    if (chip) chip.click();
    await new Promise((r) => setTimeout(r, 700));
    return { applied, after: document.querySelectorAll('.msg[data-anchored]').length, toggled: !!chip };`);
  assert.equal(out.applied, 1, '锚点没有被标记');
  assert.equal(out.toggled, true, '没找到切换开关');
  assert.equal(out.after, 0, '重新渲染后又把视野拽回了锚点');
});
