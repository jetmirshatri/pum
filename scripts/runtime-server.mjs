import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { after, before } from 'node:test';
import { fileURLToPath } from 'node:url';

// Shared by the runtime checks (scripts/check-*.mjs). Each check file starts
// its own compiled production server on a free loopback port.
export const root = fileURLToPath(new URL('../', import.meta.url));
export const secret = randomBytes(48).toString('hex');
const userAgent = 'Mozilla/5.0 Vitex runtime verification';

export async function freePort() {
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const { port } = socket.address();
  await new Promise((resolve) => socket.close(resolve));
  return port;
}

// Spawns server.js in production mode and resolves once it listens.
export async function startServer(environment) {
  const child = spawn(process.execPath, ['server.js', '--mode=production'], {
    cwd: root,
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let log = '';
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Production server did not start:\n${log}`));
    }, 15000);
    const collect = (chunk) => {
      log += chunk;
      if (log.includes('[vitex] listening')) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited with ${code}:\n${log}`));
    });
  });
  return { child, log: () => log };
}

export async function stopServer(child) {
  if (child && child.exitCode === null) {
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    await exited;
  }
}

// One server for the calling test file, started before its tests and stopped
// after them. request() sends a browser-like request to it.
export function productionServer() {
  const server = {
    origin: '',
    request: (path, init = {}) =>
      fetch(server.origin + path, {
        ...init,
        headers: { 'User-Agent': userAgent, ...init.headers },
        signal: AbortSignal.timeout(15000)
      })
  };
  let child;
  before(async () => {
    assert.ok(
      existsSync(join(root, 'build/rsc/index.js')),
      'Run npm run build before npm test.'
    );
    const port = await freePort();
    server.origin = `http://127.0.0.1:${port}`;
    ({ child } = await startServer({
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
      SESSION_SECRET: secret
    }));
  });
  after(() => stopServer(child));
  return server;
}

export function assertServerRendered(html) {
  assert.match(html, /<!DOCTYPE html>/i);
  assert.doesNotMatch(html, /Switched to client rendering|data-msg="/);
  assert.doesNotMatch(html, /window\.__PRELOADED_STATE__/);
}
