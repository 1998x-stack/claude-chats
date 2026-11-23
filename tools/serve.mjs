/**
 * Local static server + search API for the chat archive.
 *
 * The archive is 100 MB across 705 files and a 37 MB search corpus, so search runs
 * here rather than in the browser: one process lowercases the corpus once and answers
 * queries in a few milliseconds, and the page never has to download it.
 *
 * Binds to 127.0.0.1 only. Nothing is ever sent anywhere.
 *
 * Usage: node tools/serve.mjs [--port 8787] [--open]
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB = path.join(ROOT, 'web');
const DATA = path.join(WEB, 'data');

const argv = process.argv.slice(2);
const flag = (name, short) => {
  const i = argv.findIndex((a) => a === `--${name}` || (short && a === `-${short}`));
  return i >= 0 ? argv[i + 1] : null;
};
const PORT = Number(flag('port', 'p') || process.env.PORT || 8787);
const OPEN = argv.includes('--open') || argv.includes('-o');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.gz': 'application/gzip',
};

const toBuffer = (b) => (typeof b === 'string' ? Buffer.from(b) : b);

function send(res, status, body, headers = {}, req = null) {
  const acceptsGzip = /\bgzip\b/.test(req?.headers['accept-encoding'] || '');
  let payload = body;
  const h = { ...headers };
  const size = typeof body === 'string' ? Buffer.byteLength(body) : body?.length ?? 0;
  if (acceptsGzip && size > 1024) {
    payload = zlib.gzipSync(toBuffer(body), { level: 6 });
    h['content-encoding'] = 'gzip';
    h['vary'] = 'accept-encoding';
  }
  h['content-length'] = typeof payload === 'string' ? Buffer.byteLength(payload) : payload.length;
  res.writeHead(status, h);
  if (req?.method === 'HEAD') res.end();
  else res.end(payload);
}

const sendJson = (res, status, obj, req) =>
  send(res, status, JSON.stringify(obj), { 'content-type': MIME['.json'], 'cache-control': 'no-store' }, req);

// ---------------------------------------------------------------------------
// search
// ---------------------------------------------------------------------------

let corpus = null;      // [ [id, text], ... ] in original case
let lower = null;       // parallel lowercase copy used for matching
let lengthsDiffer = 0;  // chats whose lowercase form is not length-preserving

function loadCorpus() {
  if (corpus) return;
  const file = path.join(DATA, 'corpus.json');
  if (!fs.existsSync(file)) {
    throw new Error(`missing ${path.relative(ROOT, file)} — run: node tools/build.mjs`);
  }
  const t = Date.now();
  corpus = JSON.parse(fs.readFileSync(file, 'utf8'));
  lower = new Array(corpus.length);
  for (let i = 0; i < corpus.length; i++) {
    const text = corpus[i][1];
    const l = text.toLowerCase();
    if (l.length !== text.length) lengthsDiffer++;
    lower[i] = l;
  }
  const mb = (n) => (n / 1048576).toFixed(1);
  console.log(`search corpus: ${corpus.length} chats, ${mb(corpus.reduce((n, c) => n + c[1].length, 0) / 1.048576)} M chars`
    + ` indexed in ${Date.now() - t} ms${lengthsDiffer ? ` (${lengthsDiffer} not length-preserving)` : ''}`);
}

/**
 * A window of original-case text around the first hit. Matching happens on the
 * lowercase copy (same offsets in practice), so the same offsets are read back out
 * of the original text to keep the snippet's real casing.
 */
function snippetFor(i, at, len) {
  const text = corpus[i][1];
  const PAD = 90;
  let start = Math.max(0, at - PAD);
  let end = Math.min(text.length, at + len + PAD);
  if (start > 0) {
    const sp = text.lastIndexOf(' ', start);
    const nl = text.lastIndexOf('\n', start);
    const cut = Math.max(sp, nl);
    if (cut > 0 && cut < at) start = cut + 1;
  }
  if (end < text.length) {
    const sp = text.indexOf(' ', end);
    const nl = text.indexOf('\n', end);
    const cut = [sp, nl].filter((x) => x > 0).sort((a, b) => a - b)[0];
    if (cut > at + len) end = cut;
  }
  return (start > 0 ? '…' : '') + text.slice(start, end).replace(/\s+/g, ' ').trim() + (end < text.length ? '…' : '');
}

function search(q, limit) {
  loadCorpus();
  const needle = q.toLowerCase();
  if (!needle) return { results: [], total: 0, ms: 0 };
  const t = Date.now();
  const results = [];
  let total = 0;
  for (let i = 0; i < lower.length; i++) {
    const hay = lower[i];
    const at = hay.indexOf(needle);
    if (at < 0) continue;
    total++;
    let hits = 0;
    let p = at;
    while (p >= 0 && hits < 999) { hits++; p = hay.indexOf(needle, p + needle.length); }
    results.push({ id: corpus[i][0], hits, at, snippet: snippetFor(i, at, needle.length) });
  }
  results.sort((a, b) => b.hits - a.hits || a.at - b.at);
  return { results: results.slice(0, limit), total, ms: Date.now() - t };
}

// ---------------------------------------------------------------------------

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/search') {
    const q = (url.searchParams.get('q') || '').trim();
    const limit = Math.min(Number(url.searchParams.get('limit')) || 200, 500);
    if (!q) return sendJson(res, 200, { results: [], total: 0, ms: 0 }, req);
    try {
      return sendJson(res, 200, search(q, limit), req);
    } catch (e) {
      return sendJson(res, 500, { error: String(e.message || e) }, req);
    }
  }

  if (url.pathname === '/api/reload') {
    corpus = null; lower = null; lengthsDiffer = 0;
    return sendJson(res, 200, { ok: true }, req);
  }

  let rel = decodeURIComponent(url.pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  const target = path.join(WEB, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!target.startsWith(WEB)) return send(res, 403, 'forbidden', {}, req);

  fs.stat(target, (err, st) => {
    if (err || !st.isFile()) {
      return send(res, 404, 'not found', { 'content-type': 'text/plain; charset=utf-8' }, req);
    }
    const ext = path.extname(target).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    // no-store keeps edits visible; the archive is local, so caching buys nothing
    fs.readFile(target, (e2, buf) => {
      if (e2) return send(res, 500, 'read error', {}, req);
      const body = /^(text|application\/(json|javascript))/.test(type) ? buf.toString('utf8') : buf;
      send(res, 200, body, { 'content-type': type, 'cache-control': 'no-store' }, req);
    });
  });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`port ${PORT} is in use — try: node tools/serve.mjs --port ${PORT + 1}`);
    process.exit(1);
  }
  throw e;
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}/`;
  console.log(`claude archive  ${url}`);
  console.log(`serving         ${path.relative(process.cwd(), WEB) || WEB}`);
  if (OPEN) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    spawn(cmd, [url], { stdio: 'ignore', detached: true }).unref();
  }
});
