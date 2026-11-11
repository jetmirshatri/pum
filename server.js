import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';

const modeArgument = process.argv
  .slice(2)
  .find((argument) => argument.startsWith('--mode='));
const mode =
  modeArgument?.slice('--mode='.length) ||
  process.env.NODE_ENV ||
  'development';

if (mode !== 'development' && mode !== 'production') {
  console.error(`[vitex] invalid mode: ${mode}`);
  process.exit(1);
}

process.env.NODE_ENV = mode;

const isDev = mode === 'development';
if (!isDev && !process.env.SESSION_SECRET) {
  console.error('[vitex] SESSION_SECRET must be set in production');
  process.exit(1);
}
const portRaw = process.env.PORT ?? (isDev ? '3001' : '3000');
const PORT = Number.parseInt(portRaw, 10);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`[vitex] invalid PORT value: ${portRaw}`);
  process.exit(1);
}

// Production sits behind a reverse proxy on the same host, so it listens on
// loopback unless HOST says otherwise.
const HOST = process.env.HOST ?? (isDev ? 'localhost' : '127.0.0.1');

const [
  { createRequestListener },
  { default: express },
  { default: expressStaticGzip },
  { default: morgan }
] = await Promise.all([
  import('@remix-run/node-fetch-server'),
  import('express'),
  import('express-static-gzip'),
  import('morgan')
]);

const attachNonce = (_request, response, next) => {
  response.locals.cspNonce = randomBytes(16).toString('base64');
  next();
};

const securityHeaders = (_request, response, next) => {
  response.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  response.setHeader('cross-origin-opener-policy', 'same-origin');
  if (!isDev) {
    response.setHeader(
      'strict-transport-security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  response.setHeader('x-content-type-options', 'nosniff');
  response.setHeader('x-frame-options', 'DENY');
  response.setHeader('x-download-options', 'noopen');
  response.setHeader(
    'permissions-policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  const nonce = response.locals.cspNonce;

  if (isDev) {
    response.setHeader(
      'content-security-policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' ws: wss:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'"
    );
  } else {
    // style-src-attr 'unsafe-inline' is required by Motion's runtime
    // element.style mutations (style attributes cannot carry a nonce). Scripts
    // stay locked to nonce + strict-dynamic.
    response.setHeader(
      'content-security-policy',
      `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; script-src-elem 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; style-src-elem 'self' 'nonce-${nonce}'; style-src-attr 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'`
    );
  }

  next();
};

class HttpException extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'HttpException';
    this.statusCode = statusCode;
    this.details = details ?? null;
  }
}

const errorHandler = (error, _request, response, _next) => {
  console.error('[vitex] request error:', error);

  if (error instanceof HttpException) {
    const status = error.statusCode;
    const body =
      status >= 500
        ? { error: 'Internal Server Error' }
        : {
            error: error.message,
            ...(error.details && { details: error.details })
          };
    response.status(status).json(body);
    return;
  }

  response.status(500).json({ error: 'Internal Server Error' });
};

const app = express().disable('x-powered-by').set('trust proxy', 1);
const server = createServer(app);

app.use(attachNonce);
app.use(securityHeaders);

// Liveness and readiness for the process manager and the reverse proxy. The
// production build is imported before the server listens, so readiness only
// has to confirm that the RSC entry resolves.
const probe = (check) => async (_request, response, next) => {
  try {
    await check();
    response
      .status(200)
      .set('cache-control', 'no-store')
      .json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};
app.get(
  '/healthz',
  probe(async () => {})
);
app.get(
  '/readyz',
  probe(async () => {
    const { default: handleRequest } = await getBuild();
    if (typeof handleRequest !== 'function') {
      throw new HttpException(503, 'Service Unavailable');
    }
  })
);

if (isDev) {
  app.use(morgan('dev'));
}

let viteDevServer;
let productionBuild;
if (isDev) {
  const vite = await import('vite');
  viteDevServer = await vite.createServer({
    server: { middlewareMode: true, hmr: { server } },
    appType: 'custom'
  });
  app.use(viteDevServer.middlewares);
} else {
  // Load the complete server bundle before listening so a missing build or
  // production-only configuration error fails startup instead of request one.
  productionBuild = await import('#vitex');
  app.use(
    '/assets',
    expressStaticGzip('build/client/assets', {
      enableBrotli: true,
      orderPreference: ['br', 'gz'],
      index: false,
      serveStatic: { immutable: true, maxAge: '1y' }
    })
  );
  app.use(
    expressStaticGzip('build/client', {
      enableBrotli: true,
      orderPreference: ['br', 'gz'],
      index: false
    })
  );
}

const getBuild = async () =>
  isDev
    ? viteDevServer.environments.rsc.runner.import('/app/entry.rsc.tsx')
    : productionBuild;

app.use(async (request, response, next) => {
  try {
    const { default: handleRequest } = await getBuild();
    const listener = createRequestListener(
      (fetchRequest) => handleRequest(fetchRequest, response.locals.cspNonce),
      // Retain Express's existing trusted-proxy protocol handling when TLS
      // terminates at the reverse proxy, so same-origin action checks see HTTPS.
      { protocol: `${request.protocol}:` }
    );
    await listener(request, response);
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

server.on('error', (error) => {
  console.error('[vitex] server error:', error);
  shutdown(1);
});

server.listen(PORT, HOST, () => {
  console.log(`[vitex] listening on http://${HOST}:${PORT} (${mode})`);
  // Tells a process manager with wait_ready (PM2) that the app accepts
  // requests; a no-op without one.
  process.send?.('ready');
});

function shutdown(code) {
  server.close(() => process.exit(code));
  server.closeIdleConnections?.();
  setTimeout(() => {
    server.closeAllConnections?.();
    process.exit(code);
  }, 10000).unref();
}

process.on('uncaughtException', (error) => {
  console.error('[vitex] uncaught exception, shutting down:', error);
  shutdown(1);
});

process.on('unhandledRejection', (reason) => {
  // Logged but tolerated: only a synchronous uncaughtException (indeterminate
  // stack) is treated as fatal; forcing shutdown on every rejection would make
  // the server more fragile, not safer.
  console.error('[vitex] unhandled rejection:', reason);
});

process.on('SIGTERM', () => {
  console.log('[vitex] received SIGTERM, shutting down');
  shutdown(0);
});
process.on('SIGINT', () => {
  console.log('[vitex] received SIGINT, shutting down');
  shutdown(0);
});

export default app;
