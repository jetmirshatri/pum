'use client';

import { motion } from 'motion/react';
import { Suspense, use, useState } from 'react';
import { Form, useLoaderData, useNavigation } from 'react-router';

import { useIslandXRay } from '@/components/XRay/useIslandXRay';
import { xray } from '@/components/XRay/xray';
import { useMotionPreference } from '@/hooks/useShowcaseMotion';

import * as styles from './demo.streaming.module.css';

import type { ReactNode } from 'react';
import type { MetaFunction } from 'react-router';

import type { loader } from './demo.streaming';

export const meta: MetaFunction = () => [
  { title: 'Streaming runtime | Vitex' },
  {
    name: 'description',
    content:
      'Replay a real deferred request and use the shell while the server data is on its way.'
  }
];

const ShellInteraction = () => {
  const [taps, setTaps] = useState(0);
  return (
    <div className={styles.shellInteraction}>
      <div>
        <span className={styles.tag}>Shell / ready</span>
        <h2>You can already use this.</h2>
        <p>The interface stays responsive while the data loads.</p>
      </div>
      <button type="button" onClick={() => setTaps(taps + 1)}>
        Try the shell{' '}
        <span aria-live="polite">{taps > 0 ? `Clicked ${taps}` : '+1'}</span>
      </button>
    </div>
  );
};

export const StreamContent = ({ children }: { children: ReactNode }) => {
  const { reduced } = useMotionPreference();
  return (
    <motion.div
      className={styles.loaded}
      data-stream-state="ready"
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.35 }}>
      <span className={styles.check} aria-hidden="true">
        ✓
      </span>
      <div>
        <span className={styles.tag}>Server component / ready</span>
        {children}
      </div>
    </motion.div>
  );
};

export const StreamFallback = () => (
  <div className={styles.fallback} data-stream-state="pending">
    <span className={styles.tag}>Deferred data / in flight</span>
    <div className={styles.skeleton} aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
    <p>Waiting on the loader. The shell is already here.</p>
  </div>
);

const Transfer = ({ ready }: { ready: boolean }) => {
  const { reduced } = useMotionPreference();
  return (
    <div className={styles.transfer} aria-hidden="true">
      <svg viewBox="0 0 160 320" fill="none" aria-hidden="true">
        <path d="M0 90H80V230H160" className={styles.wire} />
        <path d="M0 230H60V110H160" className={styles.returnWire} />
        <motion.path
          d="M0 90H80V230H160"
          className={styles.packet}
          initial={false}
          animate={
            ready || reduced
              ? { strokeDashoffset: 0, opacity: ready ? 0.5 : 1 }
              : { strokeDashoffset: [160, -320], opacity: 1 }
          }
          transition={
            ready || reduced
              ? { duration: 0 }
              : { duration: 1.5, repeat: 2, ease: 'linear' }
          }
        />
        <rect
          x="45"
          y="143"
          width="65"
          height="36"
          className={styles.transferBadge}
        />
        <text x="77" y="166">
          {ready ? '200' : '•••'}
        </text>
      </svg>
    </div>
  );
};

function DeferredStatus({ slow }: { slow: ReturnType<typeof loader>['slow'] }) {
  use(slow);
  return <strong>resolved</strong>;
}

function DeferredTransfer({
  slow
}: {
  slow: ReturnType<typeof loader>['slow'];
}) {
  use(slow);
  return <Transfer ready />;
}

/** The latency picker: replaying it runs the loader again. */
export const ReplayToolbar = () => {
  const { delay } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const islandXRay = useIslandXRay('replays the request');
  return (
    <Form
      method="get"
      preventScrollReset
      className={styles.toolbar}
      {...islandXRay}>
      <div>
        <span className={styles.liveDot} /> <span>Live route loader</span>
      </div>
      <label htmlFor="stream-delay">
        Demo latency
        <select id="stream-delay" name="delay" defaultValue={delay} key={delay}>
          <option value="300">300 ms</option>
          <option value="1500">1.5 seconds</option>
          <option value="3000">3 seconds</option>
        </select>
      </label>
      <button type="submit" disabled={navigation.state !== 'idle'}>
        {navigation.state === 'idle' ? '↻ Replay request' : 'Requesting…'}
      </button>
    </Form>
  );
};

/**
 * The experiment: the server's side of the request, the transfer and the
 * browser, where `content` is the Suspense boundary the route streams in.
 */
export const StreamingLab = ({ content }: { content: ReactNode }) => {
  const { slow, delay, requestId } = useLoaderData<typeof loader>();
  const islandXRay = useIslandXRay('follows the request as it streams');
  return (
    <section
      className={styles.lab}
      aria-label="Live streaming experiment"
      {...islandXRay}>
      <div className={styles.server}>
        <div className={styles.panelLabel}>
          <span>01 / Server</span>
          <span>Express + React Router</span>
        </div>
        <div className={styles.serverGlyph} aria-hidden="true">
          <i />
          <i />
          <i />
          <span>↗</span>
        </div>
        <h2>
          One response. <br />
          More than one moment.
        </h2>
        <div className={styles.serverSteps}>
          <p>
            <span>Document shell</span>
            <strong>ready</strong>
          </p>
          <p>
            <span>Deferred loader</span>
            <Suspense
              key={requestId}
              fallback={<strong className={styles.waiting}>pending</strong>}>
              <DeferredStatus slow={slow} />
            </Suspense>
          </p>
          <p>
            <span>Configured delay</span>
            <code>{delay} ms</code>
          </p>
        </div>
        <code className={styles.serverCode}>
          {'return { slow: Promise<content> }'}
        </code>
      </div>
      <Suspense key={requestId} fallback={<Transfer ready={false} />}>
        <DeferredTransfer slow={slow} />
      </Suspense>
      <div className={styles.browser}>
        <div className={styles.browserBar}>
          <code>/demo/streaming</code>
        </div>
        <ShellInteraction />
        <div
          className={styles.deferred}
          aria-live="polite"
          aria-atomic="true"
          {...xray('suspense', 'streamed by an async Server Component')}>
          {content}
        </div>
      </div>
    </section>
  );
};
