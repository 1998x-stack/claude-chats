/**
 * What this copy may claim about itself.
 *
 * The viewer is built to run on one machine, but it is also published as a
 * static site. The banner used to assert "数据不离开这台设备" unconditionally,
 * which is true of `tools/serve.mjs` and false of the published copy. These
 * helpers turn the host into the claim that host can actually support.
 *
 * The hostname is a heuristic, not proof: a reverse proxy on localhost would be
 * misread as private. It errs toward describing a non-local copy as published,
 * which is the safe direction to be wrong in.
 */

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]', '0.0.0.0']);

/**
 * @param {string} hostname e.g. `location.hostname`
 * @returns {boolean} whether this copy is being served from this machine
 */
export function isLocalHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/\.$/, '');
  if (LOCAL_HOSTS.has(host)) return true;
  // 127.0.0.0/8 and ::1 in any spelling
  return /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) || host.endsWith('.localhost');
}

/** The label next to the logo. */
export function archiveLabel(hostname) {
  return isLocalHost(hostname) ? '本地存档' : '公开存档';
}

/** The closing claim in the banner: only say "local" when it is local. */
export function serveNote(hostname) {
  return isLocalHost(hostname) ? '数据不离开这台设备' : '此副本已发布到公网';
}
