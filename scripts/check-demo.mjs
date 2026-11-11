import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  assertServerRendered,
  productionServer,
  root
} from './runtime-server.mjs';

const { request } = productionServer();
const asyncContent = /This content was rendered by an async Server Component/;

test('async Server Components stream after the document shell', async () => {
  const response = await request('/demo/streaming?delay=3000');
  assert.equal(response.status, 200);
  const decoder = new TextDecoder();
  let html = '';
  let sawPendingBeforeReady = false;
  for await (const chunk of response.body) {
    html += decoder.decode(chunk, { stream: true });
    if (
      html.includes('data-stream-state="pending"') &&
      !html.includes('data-stream-state="ready"')
    ) {
      sawPendingBeforeReady = true;
    }
  }
  html += decoder.decode();
  assertServerRendered(html);
  assert.ok(
    sawPendingBeforeReady,
    'The pending shell must arrive before the resolved content'
  );
  assert.match(html, /data-stream-state="ready"/);
  assert.match(html, asyncContent);
});

test('navigation receives an RSC payload including async server content', async () => {
  const response = await request('/demo/streaming.rsc?delay=300', {
    headers: { Accept: 'text/x-component' }
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/x-component/);
  const payload = await response.text();
  assert.doesNotMatch(payload, /<!DOCTYPE html>/i);
  assert.match(payload, asyncContent);
});

test('document route actions render their result and preserve rejection status', async () => {
  const themeResponse = await request('/theme/toggle', {
    method: 'POST',
    body: new URLSearchParams({ theme: 'dark' })
  });
  const cookie = themeResponse.headers.get('set-cookie').split(';')[0];
  const accepted = await request('/demo/actions', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: new URLSearchParams({ delay: '0' })
  });
  assert.equal(accepted.status, 200);
  const acceptedHTML = await accepted.text();
  assertServerRendered(acceptedHTML);
  assert.match(acceptedHTML, /<html[^>]*class="dark"/);
  assert.match(acceptedHTML, /data-count="1"/);
  const rejected = await request('/demo/actions', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: new URLSearchParams({ delay: '0', fail: 'on' })
  });
  assert.equal(rejected.status, 422);
  const rejectedHTML = await rejected.text();
  assertServerRendered(rejectedHTML);
  assert.match(rejectedHTML, /<html[^>]*class="dark"/);
  assert.match(rejectedHTML, /data-count="1"/);
  assert.doesNotMatch(rejectedHTML, /data-count="2"/);
});

test('the CLI page renders the command its URL describes', async () => {
  const response = await request('/demo/cli?configured=1&name=shop&git=on');
  assert.equal(response.status, 200);
  const html = await response.text();
  assertServerRendered(html);
  assert.match(html, /vitex create shop --git/);
});

test('an unknown id is a 404 from the loader, with the demo error page', async () => {
  const response = await request('/demo/routes/4');
  assert.equal(response.status, 404);
  const html = await response.text();
  assertServerRendered(html);
  assert.match(html, /A little off-route\./);
});

test('the X-ray layer marks Server Components and client islands', async () => {
  const response = await request('/');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /data-xray-kind="server"/);
  assert.match(html, /data-xray-kind="client"/);
});

// The home page's story lives in a Server Component, and the streamed
// content in an async one: neither may reach the browser's JavaScript.
const serverOnly = [
  asyncContent,
  /a chapter takes the project\s+apart a little further/
];

test('Server Component code stays out of browser bundles', async () => {
  const directory = join(root, 'build/client/assets');
  for (const file of (await readdir(directory)).filter((name) =>
    name.endsWith('.js')
  )) {
    const source = await readFile(join(directory, file), 'utf8');
    for (const text of serverOnly) assert.doesNotMatch(source, text, file);
  }
});
