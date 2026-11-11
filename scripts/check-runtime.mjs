import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  assertServerRendered,
  freePort,
  productionServer,
  root,
  secret,
  startServer,
  stopServer
} from './runtime-server.mjs';

const server = productionServer();
const { request } = server;

test('production refuses to listen without a session secret', () => {
  const result = spawnSync(
    process.execPath,
    ['server.js', '--mode=production'],
    {
      cwd: root,
      env: { ...process.env, SESSION_SECRET: '' },
      encoding: 'utf8',
      timeout: 5000
    }
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /SESSION_SECRET must be set in production/);
  assert.doesNotMatch(result.stdout, /listening/);
});

test('production listens on loopback unless HOST overrides it', async () => {
  const port = await freePort();
  const { HOST: _ignored, ...environment } = process.env;
  const { child, log } = await startServer({
    ...environment,
    PORT: String(port),
    SESSION_SECRET: secret
  });
  try {
    assert.match(
      log(),
      new RegExp(`listening on http://127\\.0\\.0\\.1:${port} `)
    );
  } finally {
    await stopServer(child);
  }
});

test('liveness and readiness probes answer without caching', async () => {
  for (const path of ['/healthz', '/readyz']) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { status: 'ok' });
  }
});

test('production HTML is server rendered with one fresh nonce per document', async () => {
  const response = await request('/');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-cache');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  const html = await response.text();
  assertServerRendered(html);
  assert.match(html, /<main\b/);
  const policy = response.headers.get('content-security-policy');
  const nonce = policy.match(/'nonce-([^']+)'/)[1];
  const scripts = [...html.matchAll(/<script\b[^>]*>/g)];
  assert.ok(
    scripts.length > 1,
    'Expected bootstrap and streamed payload scripts'
  );
  for (const [tag] of scripts) {
    assert.ok(tag.includes(`nonce="${nonce}"`), `Script nonce: ${tag}`);
  }
  for (const [tag] of html.matchAll(/<style\b[^>]*>/g)) {
    assert.ok(tag.includes(`nonce="${nonce}"`), `Style nonce: ${tag}`);
  }
  assert.ok(!html.includes(secret), 'Session secret must stay on the server');
  const second = await request('/');
  await second.text();
  assert.notEqual(second.headers.get('content-security-policy'), policy);
});

test('resource response status, JSON, and cache headers survive the RSC handler', async () => {
  const response = await request('/api/health');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.json()).status, 'ok');
  const disallowed = await request('/theme/toggle');
  assert.equal(disallowed.status, 405);
  assert.equal(disallowed.headers.get('allow'), 'POST');
  await disallowed.text();
});

test('theme action validates input and origin and persists a signed session', async () => {
  for (const [theme, requestOrigin, expected] of [
    ['invalid', server.origin, 400],
    ['dark', 'https://other.example', 403]
  ]) {
    const response = await request('/theme/toggle', {
      method: 'POST',
      headers: { Origin: requestOrigin },
      body: new URLSearchParams({ theme })
    });
    assert.equal(response.status, expected);
    await response.text();
  }
  for (const theme of ['dark', 'light']) {
    const response = await request('/theme/toggle', {
      method: 'POST',
      headers: { Origin: server.origin },
      body: new URLSearchParams({ theme })
    });
    assert.equal(response.status, 204);
    const cookie = response.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/i);
    assert.match(cookie, /Secure/);
    const page = await request('/', {
      headers: { Cookie: cookie.split(';')[0] }
    });
    const html = await page.text();
    assertServerRendered(html);
    assert.match(html, new RegExp(`<html[^>]*class="${theme}"`));
  }
});

test('unknown URLs retain a rendered 404 response', async () => {
  const response = await request('/missing-runtime-verification');
  assert.equal(response.status, 404);
  assertServerRendered(await response.text());
});

test('HTTPS proxy requests retain their public origin for actions', async () => {
  const response = await request('/theme/toggle', {
    method: 'POST',
    headers: {
      'X-Forwarded-Proto': 'https',
      Origin: server.origin.replace('http:', 'https:')
    },
    body: new URLSearchParams({ theme: 'dark' })
  });
  assert.equal(response.status, 204);
  assert.match(response.headers.get('set-cookie'), /Secure/);
});

test('fetcher theme actions return a decodable RSC envelope and signed cookie', async () => {
  const response = await request('/theme/toggle.rsc', {
    method: 'POST',
    headers: { Origin: server.origin },
    body: new URLSearchParams({ theme: 'dark' })
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/x-component/);
  assert.match(await response.text(), /"actionData"/);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  const page = await request('/', {
    headers: { Cookie: cookie.split(';')[0] }
  });
  assert.match(await page.text(), /<html[^>]*class="dark"/);
});

test('route discovery renders its layouts without serialized server errors', async () => {
  const response = await request('/.manifest?paths=%2F');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/x-component/);
  const payload = await response.text();
  assert.match(payload, /"type":"manifest"/);
  assert.doesNotMatch(payload, /^[0-9a-f]+:E/m);
  assert.doesNotMatch(payload, /getRequest must be called/);
});

test('server-only code and secrets are absent from browser bundles', async () => {
  const directory = join(root, 'build/client/assets');
  const files = await readdir(directory);
  let checked = 0;
  for (const file of files.filter((name) => name.endsWith('.js'))) {
    const source = await readFile(join(directory, file), 'utf8');
    assert.ok(!source.includes(secret));
    assert.doesNotMatch(source, /process\.env\.SESSION_SECRET/);
    checked++;
  }
  assert.ok(checked > 0, 'Expected JavaScript assets');
  const compressed = files.find((name) => name.endsWith('.js.br'));
  assert.ok(compressed, 'Expected a precompressed browser asset');
  const asset = await request(`/assets/${compressed.slice(0, -3)}`, {
    headers: { 'Accept-Encoding': 'br' }
  });
  assert.equal(asset.status, 200);
  assert.equal(asset.headers.get('content-encoding'), 'br');
  assert.match(asset.headers.get('cache-control'), /immutable/);
  await asset.arrayBuffer();
});
