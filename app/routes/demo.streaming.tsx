import 'server-only';

import { Suspense } from 'react';

import { DemoPage } from '@/components/DemoPage/DemoPage';
import { xray } from '@/components/XRay/xray';

import * as styles from './demo.streaming.module.css';
import {
  ReplayToolbar,
  StreamContent,
  StreamFallback,
  StreamingLab
} from './demo.streaming.view';

import type { LoaderFunctionArgs } from 'react-router';

export const loader = ({ request }: LoaderFunctionArgs) => {
  const requested = Number(
    new URL(request.url).searchParams.get('delay') ?? 1500
  );
  const delay = [300, 1500, 3000].includes(requested) ? requested : 1500;
  return {
    delay,
    requestId: crypto.randomUUID(),
    slow: new Promise<{ message: string; detail: string }>((resolve) => {
      setTimeout(
        () =>
          resolve({
            message: 'The rest just arrived.',
            detail: 'This content was rendered by an async Server Component.'
          }),
        delay
      );
    })
  };
};

export { meta } from './demo.streaming.view';

async function DeferredServerContent({
  slow
}: {
  slow: ReturnType<typeof loader>['slow'];
}) {
  const content = await slow;
  return (
    <StreamContent>
      <h3>{content.message}</h3>
      <p>{content.detail}</p>
    </StreamContent>
  );
}

// The page is a Server Component. The toolbar and the experiment are client
// islands; the experiment shows a Suspense boundary that this route fills
// with an async Server Component once the loader's promise resolves.
export default function StreamingRoute({
  loaderData
}: {
  loaderData: ReturnType<typeof loader>;
}) {
  return (
    <DemoPage
      eyebrow="React Router / streaming runtime"
      title="A head start for every screen."
      description="Send the useful part first. Add a little latency, replay the request, and keep using the shell while the rest arrives."
      previous={{ to: '/demo/cli', label: 'Back to CLI' }}
      next={{ to: '/demo/actions', label: 'Continue to optimistic state' }}>
      <ReplayToolbar />
      <StreamingLab
        content={
          <Suspense key={loaderData.requestId} fallback={<StreamFallback />}>
            <DeferredServerContent slow={loaderData.slow} />
          </Suspense>
        }
      />
      <div
        className={styles.explanation}
        {...xray('server', 'its code stays on the server')}>
        <span className={styles.explanationMark} aria-hidden="true">
          ↳
        </span>
        <p>
          <strong>The wait belongs to the data, not the whole page.</strong> On
          the first visit, React streams the document. Replay requests fetch a
          fresh Server Component through React Router. The latency above is an
          intentional server delay.
        </p>
        <code>RSC + Suspense + SSR</code>
      </div>
    </DemoPage>
  );
}
