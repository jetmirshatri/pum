import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream
} from '@vitejs/plugin-rsc/rsc';
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from 'react-router';

import { routes } from './routes';

export default async function handleRequest(request: Request, nonce: string) {
  const serverResponse = await matchRSCServerRequest({
    request,
    routes: routes(request),
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    generateResponse(match, options) {
      const headers = new Headers(match.headers);
      headers.set('Content-Type', 'text/x-component');
      // Even an empty route action needs a Flight envelope for the browser to
      // decode. Plain resource requests bypass this callback and retain 204.
      const status = [204, 205, 304].includes(match.statusCode)
        ? 200
        : match.statusCode;
      return new Response(renderToReadableStream(match.payload, options), {
        status,
        headers
      });
    }
  });
  const { generateHTML } = await import.meta.viteRsc.loadModule<
    typeof import('./entry.ssr')
  >('ssr', 'index');

  return generateHTML(request, serverResponse, nonce);
}

if (import.meta.hot) {
  import.meta.hot.accept();
}
