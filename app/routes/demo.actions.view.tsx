'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useActionData, useFetcher, useLoaderData } from 'react-router';

import { useIslandXRay } from '@/components/XRay/useIslandXRay';
import { useMotionPreference } from '@/hooks/useShowcaseMotion';

import * as styles from './demo.actions.module.css';

import type { MetaFunction } from 'react-router';

import type { action, loader } from './demo.actions';

export const meta: MetaFunction = () => [
  { title: 'Optimistic state | Vitex' },
  {
    name: 'description',
    content:
      'Watch a real fetcher action update the browser optimistically, then confirm or roll back against the server response.'
  }
];

const NumberDisplay = ({ value, label }: { value: number; label: string }) => {
  const { reduced } = useMotionPreference();
  return (
    <output
      className={styles.number}
      aria-label={`${label}: ${value}`}
      data-count={value}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.strong
          key={value}
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -18 }}
          transition={{ duration: reduced ? 0 : 0.2 }}>
          {value}
        </motion.strong>
      </AnimatePresence>
    </output>
  );
};

/**
 * The experiment: a fetcher form that counts in the browser first, and the
 * live status of the fetcher.
 */
export const OptimisticCounter = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher<typeof action>();
  const { reduced } = useMotionPreference();
  const formXRay = useIslandXRay('a fetcher form with an optimistic count');
  const statusXRay = useIslandXRay("announces the fetcher's state");
  // A document POST renders action data; an enhanced fetcher revalidates
  // loader data separately. Both paths must work before browser hydration.
  const result = fetcher.data ?? actionData;
  const serverCount = result?.count ?? loaderData?.count ?? 0;
  const submitting = fetcher.state === 'submitting';
  const pending = fetcher.state !== 'idle';
  const optimistic = submitting ? serverCount + 1 : serverCount;
  const rejected = !pending && !!result?.error;
  const message = submitting
    ? 'The browser moved first. The server is still working.'
    : fetcher.state === 'loading'
      ? 'The response is back. React Router is revalidating the route.'
      : rejected
        ? 'The server said no. The optimistic change rolled back.'
        : result
          ? 'Confirmed. Both sides agree on the new value.'
          : 'Make a change. Watch the browser take the first step.';

  return (
    <>
      <fetcher.Form method="post" {...formXRay}>
        <div className={styles.toolbar}>
          <span className={styles.kicker}>A real fetcher action</span>
          <label htmlFor="action-delay">
            Demo latency{' '}
            <select
              id="action-delay"
              name="delay"
              defaultValue="800"
              disabled={pending}>
              <option value="0">No added delay</option>
              <option value="800">800 ms</option>
              <option value="2000">2 seconds</option>
            </select>
          </label>
          <label className={styles.failOption}>
            <input type="checkbox" name="fail" disabled={pending} /> Reject this
            request
          </label>
        </div>
        <section className={styles.scene} aria-label="Browser and server state">
          <div className={styles.browser}>
            <div className={styles.endpointLabel}>
              <span>01 / Browser</span>
              <span className={styles.dot} />
            </div>
            <p>Your interface</p>
            <NumberDisplay value={optimistic} label="Browser count" />
            <span className={styles.valueLabel}>
              {submitting
                ? 'Optimistic value'
                : rejected
                  ? 'Rolled back'
                  : 'In sync'}
            </span>
            <motion.button
              type="submit"
              disabled={pending}
              whileTap={reduced ? undefined : { scale: 0.98 }}>
              {pending ? 'Waiting for the server…' : 'Make it +1'}{' '}
              <span aria-hidden="true">{pending ? '···' : '↗'}</span>
            </motion.button>
          </div>
          <div className={styles.connection} aria-hidden="true">
            <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
              <path d="M0 80H200M0 120H200" className={styles.track} />
              <path
                d="m190 75 8 5-8 5M10 115l-8 5 8 5"
                className={styles.track}
              />
              {submitting && !reduced && (
                <motion.rect
                  x="0"
                  y="73"
                  width="30"
                  height="14"
                  className={styles.packet}
                  animate={{ x: [0, 160], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.75, repeat: 2, ease: 'linear' }}
                />
              )}
              {result && !submitting && (
                <motion.rect
                  key={`${serverCount}-${rejected}`}
                  x="160"
                  y="113"
                  width="30"
                  height="14"
                  className={styles.packet}
                  initial={{ x: 0 }}
                  animate={{ x: reduced ? 0 : -160, opacity: [1, 1, 0] }}
                  transition={{ duration: reduced ? 0 : 0.65 }}
                />
              )}
              <text x="100" y="59">
                action +1
              </text>
              <text x="100" y="152">
                confirm / reconcile
              </text>
            </svg>
          </div>
          <div className={styles.server}>
            <div className={styles.endpointLabel}>
              <span>02 / Server</span>
              <span>React Router</span>
            </div>
            <p>Last confirmed value</p>
            <NumberDisplay value={serverCount} label="Server count" />
            <span className={styles.valueLabel}>
              {submitting
                ? 'Processing the action'
                : rejected
                  ? 'Change rejected'
                  : 'Source of truth'}
            </span>
            <div className={styles.serverFooter}>
              <code>action()</code>
              <span>
                {submitting
                  ? 'pending'
                  : rejected
                    ? '422 / rejected'
                    : result
                      ? '200 / confirmed'
                      : 'ready'}
              </span>
            </div>
          </div>
        </section>
      </fetcher.Form>
      <div
        className={styles.status}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-fetcher-state={fetcher.state}
        {...statusXRay}>
        <span className={styles.stateBadge} data-pending={pending}>
          {fetcher.state}
        </span>
        <p>{message}</p>
      </div>
    </>
  );
};
