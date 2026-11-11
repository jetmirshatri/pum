import {
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback
} from '@vitejs/plugin-rsc/browser';
import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import {
  unstable_createCallServer as createCallServer,
  unstable_getRSCStream as getRSCStream,
  unstable_RSCHydratedRouter as RSCHydratedRouter
} from 'react-router/dom';

import { NonceContext } from './nonce';

import type { DataRouter } from 'react-router';
import type { unstable_RSCPayload as RSCPayload } from 'react-router/dom';

setServerCallback(
  createCallServer({
    createFromReadableStream,
    createTemporaryReferenceSet,
    encodeReply
  })
);

// Read the DOM property: browsers conceal nonce values in getAttribute().
const nonce =
  document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce ?? '';

if (import.meta.env.PROD) {
  const devTools = (
    window as unknown as {
      __REACT_DEVTOOLS_GLOBAL_HOOK__?: Record<string, unknown>;
    }
  ).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (devTools && typeof devTools === 'object') {
    for (const [key, value] of Object.entries(devTools)) {
      devTools[key] = typeof value === 'function' ? undefined : null;
    }
  }
}

createFromReadableStream<RSCPayload>(getRSCStream()).then((payload) => {
  startTransition(async () => {
    const formState =
      payload.type === 'render' ? await payload.formState : undefined;
    hydrateRoot(
      document,
      <StrictMode>
        <NonceContext.Provider value={nonce}>
          <RSCHydratedRouter
            createFromReadableStream={createFromReadableStream}
            payload={payload}
          />
        </NonceContext.Provider>
      </StrictMode>,
      { formState }
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.on('rsc:update', () => {
    const router = (
      window as unknown as { __reactRouterDataRouter?: DataRouter }
    ).__reactRouterDataRouter;
    void router?.revalidate();
  });
}
