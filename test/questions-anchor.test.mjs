import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

/**
 * A question in the gallery links back to `#/c/<convId>/m/<msgId>`. That only
 * works if the transcript carries message ids and the anchor jump runs after
 * the initial scroll-to-bottom, otherwise the landing scroll wins.
 */
const DATA = JSON.parse(fs.readFileSync('web/data/questions.json', 'utf8'));

async function probe(name, expr, wait = '4000') {
  const file = `/tmp/qanchor-${name}.js`;
  fs.writeFileSync(file, expr);
  const out = execFileSync('node', ['tools/cdp.mjs', 'http://127.0.0.1:8787/', file, '--wait', wait],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const text = out.trim();
  if (text.startsWith('ERR ')) throw new Error(`${name}: ${text}`);
  return JSON.parse(text);
}

test('每条消息都带 data-msg', async () => {
  const out = await probe('ids', `
    location.hash = '#/c/${DATA.questions[0].sources[0].convId}';
    await new Promise((r) => setTimeout(r, 2000));
    const msgs = [...document.querySelectorAll('.msg')];
    return { n: msgs.length, withId: msgs.filter((m) => /^[0-9a-f-]{36}$/.test(m.dataset.msg || '')).length };`);
  assert.ok(out.n > 0, '没有渲染出消息');
  assert.equal(out.withId, out.n, '有消息没有 data-msg');
});

test('锚点路由会滚动到那条消息并标记它', async () => {
  const q = DATA.questions.find((x) => x.sources[0].msgIds.length);
  const src = q.sources[0];
  const out = await probe('jump', `
    location.hash = '#/c/${src.convId}/m/${src.msgIds[0]}';
    await new Promise((r) => setTimeout(r, 2200));
    const el = document.querySelector('.msg[data-msg="${src.msgIds[0]}"]');
    const r = el && el.getBoundingClientRect();
    return {
      found: !!el,
      anchored: el?.dataset.anchored === 'true',
      inView: !!r && r.top > -60 && r.top < window.innerHeight,
      hash: location.hash,
    };`);
  assert.equal(out.found, true, '找不到目标消息');
  assert.equal(out.anchored, true, '目标消息没有被标记');
  assert.equal(out.inView, true, '目标消息没有滚动到视野里');
  assert.equal(out.hash, `#/c/${src.convId}/m/${src.msgIds[0]}`);
});

test('无效 msgId 不崩，仍停在对话页且没有横向溢出', async () => {
  const src = DATA.questions[0].sources[0];
  const out = await probe('bad', `
    location.hash = '#/c/${src.convId}/m/00000000-0000-4000-8000-000000000000';
    await new Promise((r) => setTimeout(r, 2000));
    return {
      msgs: document.querySelectorAll('.msg').length,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      anyAnchored: document.querySelectorAll('.msg[data-anchored]').length,
    };`);
  assert.ok(out.msgs > 0, '对话没有渲染出来');
  assert.equal(out.overflow, false);
  assert.equal(out.anyAnchored, 0, '不存在的消息不该被标记');
});

test('普通对话路由仍然落在最后一条消息上（锚点没有改坏它）', async () => {
  const src = DATA.questions[0].sources[0];
  const out = await probe('plain', `
    location.hash = '#/c/${src.convId}';
    await new Promise((r) => setTimeout(r, 2200));
    const msgs = [...document.querySelectorAll('.msg')];
    const last = msgs[msgs.length - 1];
    const r = last && last.getBoundingClientRect();
    return {
      anchored: document.querySelectorAll('.msg[data-anchored]').length,
      lastInView: !!r && r.top < window.innerHeight,
    };`);
  assert.equal(out.anchored, 0, '没有锚点时不该标记任何消息');
  assert.equal(out.lastInView, true, '普通打开对话应当仍然停在末尾');
});
