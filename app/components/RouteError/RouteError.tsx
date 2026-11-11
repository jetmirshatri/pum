'use client';

import { MotionConfig, motion } from 'motion/react';
import {
  isRouteErrorResponse,
  Link,
  useLocation,
  useRouteError
} from 'react-router';

import { useIslandXRay } from '@/components/XRay/useIslandXRay';
import { DESTINATIONS } from '@/config/navigation';
import { site } from '@/config/site';
import { useShowcaseMotion } from '@/hooks/useShowcaseMotion';

import * as styles from './routeerror.module.css';

import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => [
  { title: `Route not found | ${site.title}` }
];

const distance = (a: string, b: string) => {
  let row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const next = [i];
    for (let j = 1; j <= b.length; j += 1) {
      next[j] = Math.min(
        (next[j - 1] ?? 0) + 1,
        (row[j] ?? 0) + 1,
        (row[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    row = next;
  }
  return row[b.length] ?? 0;
};

export const RouteError = () => {
  const error = useRouteError();
  const { pathname } = useLocation();
  const { ref, running, reduced, paused, setPaused } = useShowcaseMotion();
  const islandXRay = useIslandXRay(
    'an error boundary, which runs in the browser'
  );
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const missing = status === 404;
  const nearest =
    missing && pathname.length < 100
      ? DESTINATIONS.map((route) => ({
          ...route,
          distance: distance(pathname, route.path)
        })).sort((a, b) => a.distance - b.distance)[0]
      : undefined;
  const suggestion = nearest && nearest.distance <= 3 ? nearest : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={ref}
        className={styles.page}
        aria-labelledby="error-title"
        {...islandXRay}>
        <div className={styles.panel}>
          <div className={styles.topline}>
            <span>
              {site.title.toUpperCase()} / ROUTE {status}
            </span>
            <span>A detour, then onward.</span>
          </div>
          <div className={styles.artwork} aria-hidden="true">
            <svg viewBox="0 0 1000 380" fill="none" aria-hidden="true">
              <path
                d="M40 290 210 190 395 300 610 176 790 280 960 182M55 316 210 226M780 280v58M610 176V65"
                className={styles.grid}
              />
              <path d="M40 290 210 190 325 256" className={styles.routeLine} />
              <path d="M685 255 790 316 960 216" className={styles.routeLine} />
              <path d="m408 298 92 54 94-54" className={styles.missingLine} />
              {running && (
                <motion.path
                  d="M40 290 210 190 325 256"
                  className={styles.signal}
                  animate={{ strokeDashoffset: [400, -400] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
              )}
              <g transform="translate(150 152)">
                <path
                  d="m0 0 50-28 50 28v12l-50 28L0 12Z"
                  className={styles.smallEdge}
                />
                <path
                  d="m0 0 50-28 50 28-50 28Z"
                  className={styles.smallTile}
                />
                <text x="50" y="5" className={styles.smallText}>
                  GET
                </text>
              </g>
              {(['hundreds', 'tens', 'ones'] as const).map((place, index) => (
                <g
                  key={place}
                  transform={`translate(${290 + index * 205} ${index === 1 ? 170 : 218})`}>
                  <motion.g
                    initial={false}
                    animate={
                      running
                        ? {
                            y: [0, index === 1 ? -16 : -7, 0],
                            rotate: index === 1 ? [-3, 3, -3] : 0
                          }
                        : { y: 0, rotate: 0 }
                    }
                    transition={{
                      duration: 5 + index,
                      repeat: running ? Infinity : 0,
                      ease: 'easeInOut'
                    }}>
                    <path
                      d="M-99-8 0-66 99-8v27L0 77-99 19Z"
                      className={styles.edge}
                      data-center={index === 1}
                    />
                    <path
                      d="M-99-8 0-66 99-8 0 50Z"
                      className={styles.tile}
                      data-center={index === 1}
                    />
                    <text
                      transform="matrix(.87 .5 -.87 .5 0 0)"
                      x="0"
                      y="24"
                      className={styles.digit}
                      data-center={index === 1}>
                      {String(status)[index]}
                    </text>
                  </motion.g>
                </g>
              ))}
              <g transform="translate(780 165)">
                <path
                  d="m0 0 50-28 50 28v12l-50 28L0 12Z"
                  className={styles.smallEdge}
                />
                <path
                  d="m0 0 50-28 50 28-50 28Z"
                  className={styles.smallTile}
                />
                <text x="50" y="5" className={styles.smallText}>
                  ?
                </text>
              </g>
              <circle cx="610" cy="65" r="4" className={styles.point} />
            </svg>
          </div>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>
              {missing ? 'Good stack. Wrong turn.' : 'The request hit a snag.'}
            </p>
            <h1 id="error-title">
              {missing ? 'A little off-route.' : 'Let’s find a way forward.'}
            </h1>
            <p className={styles.message}>
              {missing
                ? 'The app is here. This page isn’t.'
                : 'This request could not finish. You can still explore the rest of the app.'}
            </p>
            <code className={styles.path}>{pathname}</code>
            {suggestion && (
              <p className={styles.suggestion}>
                Looking for <Link to={suggestion.path}>{suggestion.path}</Link>?
              </p>
            )}
            <div className={styles.actions}>
              <Link to={suggestion?.path ?? '/'}>
                {suggestion ? `Continue to ${suggestion.name}` : 'Return home'}{' '}
                <span aria-hidden="true">↗</span>
              </Link>
              {suggestion && (
                <Link to="/">
                  Back to home <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
          {DESTINATIONS.length > 0 && (
            <nav
              className={styles.destinations}
              aria-label="Find your next destination">
              {DESTINATIONS.slice(0, 3).map((route) => (
                <Link key={route.path} to={route.path} prefetch="intent">
                  <span className={styles.symbol} aria-hidden="true">
                    {route.symbol}
                  </span>
                  <span>
                    <strong>{route.name}</strong>
                    <small>{route.description}</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </nav>
          )}
          <div className={styles.bottomline}>
            <span>
              {missing
                ? '404 / Destination unavailable'
                : `${status} / Request interrupted`}
            </span>
            <button
              type="button"
              disabled={reduced}
              onClick={() => setPaused(!paused)}>
              {reduced
                ? 'Reduced motion'
                : paused
                  ? 'Play motion'
                  : 'Pause motion'}
            </button>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
};
