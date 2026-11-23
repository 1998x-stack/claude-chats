import test from 'node:test';
import assert from 'node:assert/strict';
import { isLocalHost, archiveLabel, serveNote } from '../web/provenance.mjs';

test('本地地址被认成在本机', () => {
  for (const h of ['127.0.0.1', 'localhost', '::1', '[::1]', '0.0.0.0', '127.0.0.1.']) {
    assert.equal(isLocalHost(h), true, h);
  }
  for (const h of ['127.1.2.3', 'app.localhost']) {
    assert.equal(isLocalHost(h), true, h);
  }
});

test('公网地址不会被当成在本机', () => {
  for (const h of ['1998x-stack.github.io', 'example.com', '', undefined, '192.168.1.10']) {
    assert.equal(isLocalHost(h), false, String(h));
  }
});

test('本地副本的字样与过去完全一致', () => {
  // fidelity work measured these strings; a published copy must not change them
  assert.equal(archiveLabel('127.0.0.1'), '本地存档');
  assert.equal(serveNote('127.0.0.1'), '数据不离开这台设备');
});

test('公开副本不再声称数据没有离开这台设备', () => {
  assert.equal(serveNote('1998x-stack.github.io'), '此副本已发布到公网');
  assert.match(serveNote('1998x-stack.github.io'), /公网/);
  assert.doesNotMatch(serveNote('1998x-stack.github.io'), /不离开这台设备/);
  assert.equal(archiveLabel('1998x-stack.github.io'), '公开存档');
});
