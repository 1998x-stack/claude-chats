/**
 * Tiny Chrome DevTools Protocol client: load a page headless and evaluate an
 * expression in it, so the UI can be checked without being able to see it.
 *
 *   node /tmp/cdp.mjs <url> <expr-file> [--wait ms] [--size WxH] [--dpr n]
 */
import { spawn } from 'node:child_process';
import { chromePath } from './chrome.mjs';
import fs from 'node:fs';

const [url, exprFile, ...rest] = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : dflt;
};
const WAIT = Number(arg('wait', 2500));
const SIZE = arg('size', '1512x861');
const DPR = Number(arg('dpr', 2));
const [W, H] = SIZE.split('x').map(Number);
const PORT = 9333 + Math.floor(Math.random() * 400);
const CHROME = chromePath();

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--force-device-scale-factor=${DPR}`,
  `--window-size=${W},${H}`,
  '--no-first-run', '--no-default-browser-check',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'ignore'] });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targets() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page;
    } catch { /* not up yet */ }
    await sleep(150);
  }
  throw new Error('chrome did not come up');
}

function rpc(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = rpc.n = (rpc.n || 0) + 1;
    const onMsg = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id !== id) return;
      ws.removeEventListener('message', onMsg);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const main = async () => {
  const page = await targets();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  const logs = [];
  await rpc(ws, 'Runtime.enable');
  await rpc(ws, 'Log.enable');
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Log.entryAdded') logs.push(`[${msg.params.entry.level}] ${msg.params.entry.text}`);
    if (msg.method === 'Runtime.consoleAPICalled') {
      logs.push(`[console.${msg.params.type}] ${msg.params.args.map((a) => a.value ?? a.description).join(' ')}`);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      logs.push(`[exception] ${d.text} ${d.exception?.description || ''}`);
    }
  });

  await rpc(ws, 'Page.enable');
  await rpc(ws, 'Page.navigate', { url });
  await sleep(WAIT);

  const expr = fs.readFileSync(exprFile, 'utf8');
  const out = await rpc(ws, 'Runtime.evaluate', {
    expression: '(async () => { try { return JSON.stringify(await (async () => { '
      + expr + '\n})()); } catch (e) { return ("ERR " + e.message); } })()',
    awaitPromise: true,
    returnByValue: true,
  });

  if (out.exceptionDetails) console.log('EXCEPTION', JSON.stringify(out.exceptionDetails).slice(0, 600));
  console.log(out.result?.value === undefined ? `RAW ${JSON.stringify(out).slice(0, 700)}` : out.result.value);

  if (logs.length) {
    console.log('\n=== console / log ===');
    for (const l of logs.slice(0, 40)) console.log(l);
  }
  ws.close();
  chrome.kill();
  process.exit(0);
};

main().catch((e) => { console.error('FAILED', e.message); chrome.kill(); process.exit(1); });
