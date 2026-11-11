import { createFromReadableStream } from '@vitejs/plugin-rsc/ssr';
import { isbot } from 'isbot';
import { StrictMode } from 'react';
import { renderToReadableStream } from 'react-dom/server.edge';
import {
  unstable_RSCStaticRouter as RSCStaticRouter,
  unstable_routeRSCServerRequest as routeRSCServerRequest
} from 'react-router';

import { NonceContext } from './nonce';

const ABORT_DELAY = 10_000;

export async function generateHTML(
  request: Request,
  serverResponse: Response,
  nonce: string
): Promise<Response> {
  const response = await routeRSCServerRequest({
    request,
    serverResponse,
    createFromReadableStream,
    nonce,
    async renderHTML(getPayload, options) {
      const payload = getPayload();
      const bootstrapScriptContent =
        await import.meta.viteRsc.loadBootstrapScriptContent('index');
      const stream = await renderToReadableStream(
        <StrictMode>
          <NonceContext.Provider value={nonce}>
            <RSCStaticRouter getPayload={getPayload} nonce={nonce} />
          </NonceContext.Provider>
        </StrictMode>,
        {
          ...options,
          bootstrapScriptContent,
          formState: await payload.formState,
          signal: AbortSignal.any([
            request.signal,
            AbortSignal.timeout(ABORT_DELAY)
          ])
        }
      );

      const userAgent = request.headers.get('user-agent');
      if (!userAgent || isbot(userAgent)) await stream.allReady;
      return stream;
    }
  });

  if (!response.headers.has('Cache-Control')) {
    response.headers.set('Cache-Control', 'no-cache');
  }
  return response;
}
