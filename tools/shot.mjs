/**
 * Pixel-exact screenshots of the viewer, for comparing against the reference.
 *
 * Sets device metrics over CDP rather than trusting --window-size, so the output is
 * exactly W x H CSS pixels at the given device scale factor (the reference is
 * 3024x1722, i.e. 1512x861 at scale 2).
 *
 *   node tools/shot.mjs <url> <out.png> [--size 1512x861] [--dpr 2] [--wait 4000]
 *                       [--before expr.js] [--full]
 */
import { spawn } from 'node:child_process';
import { chromePath } from './chrome.mjs';
import fs from 'node:fs';

const [url, out, ...rest] = process.argv.slice(2);
const arg = (n, d) => { const i = rest.indexOf(`--${n}`); return i >= 0 ? rest[i + 1] : d; };
const [W, H] = arg('size', '1512x861').split('x').map(Number);
const DPR = Number(arg('dpr', 2));
const WAIT = Number(arg('wait', 4000));
const BEFORE = arg('before', null);
const FULL = rest.includes('--full');
const PORT = 9800 + Math.floor(Math.random() * 300);
const CHROME = chromePath();

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'ignore'] });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function rpc(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = rpc.n = (rpc.n || 0) + 1;
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id !== id) return;
      ws.removeEventListener('message', onMsg);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const main = async () => {
  let page = null;
  for (let i = 0; i < 60 && !page; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    } catch { /* still starting */ }
    if (!page) await sleep(150);
  }
  if (!page) throw new Error('chrome did not come up');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  await rpc(ws, 'Page.enable');
  await rpc(ws, 'Emulation.setDeviceMetricsOverride', {
    width: W, height: H, deviceScaleFactor: DPR, mobile: false,
  });
  await rpc(ws, 'Page.navigate', { url });
  await sleep(WAIT);

  if (BEFORE) {
    const expr = fs.readFileSync(BEFORE, 'utf8');
    await rpc(ws, 'Runtime.evaluate', {
      expression: `(async () => { ${expr} })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    await sleep(1200);
  }

  const shot = await rpc(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: !!FULL,
  });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  const { width, height } = await rpc(ws, 'Runtime.evaluate', {
    expression: 'JSON.stringify({width: innerWidth, height: innerHeight})',
    returnByValue: true,
  }).then((r) => JSON.parse(r.result.value));
  console.log(`${out}  viewport=${width}x${height} dpr=${DPR}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
  ws.close();
  chrome.kill();
  process.exit(0);
};

main().catch((e) => { console.error('FAILED', e.message); chrome.kill(); process.exit(1); });
