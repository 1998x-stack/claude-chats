/**
 * Where is Chrome?
 *
 * cdp.mjs and shot.mjs drive a real browser, so they need a binary, and the
 * path differs per platform: this repository was developed on macOS, but the
 * UI tests also run in CI on Linux. `CHROME_PATH` wins when set; otherwise the
 * usual locations are probed, including a PATH lookup for Linux installs.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

/** @returns {string|null} an existing Chrome/Chromium binary, or null. */
export function findChrome() {
  const override = process.env.CHROME_PATH;
  if (override) return fs.existsSync(override) ? override : null;
  for (const p of CANDIDATES) {
    try { if (fs.existsSync(p)) return p; } catch { /* unreadable path: skip */ }
  }
  for (const name of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
    try {
      const found = execFileSync('which', [name], { encoding: 'utf8' }).trim();
      if (found) return found;
    } catch { /* not on PATH */ }
  }
  return null;
}

/** Like findChrome, but explains how to fix a missing browser. */
export function chromePath() {
  const found = findChrome();
  if (found) return found;
  throw new Error(
    'no Chrome/Chromium found; install one or set CHROME_PATH to its binary '
    + `(looked in ${CANDIDATES.length} locations and on PATH)`,
  );
}
