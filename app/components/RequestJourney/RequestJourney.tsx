'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { TechnologyIcon } from '@/components/TechnologyIcon/TechnologyIcon';
import { useIslandXRay } from '@/components/XRay/useIslandXRay';
import { useShowcaseMotion } from '@/hooks/useShowcaseMotion';

import * as styles from './requestjourney.module.css';

const STEPS = [
  {
    label: 'Receive',
    tool: 'Express',
    icon: 'express',
    x: 145,
    y: 140,
    boundary: 'Server',
    file: 'server.js',
    title: 'A request arrives.',
    body: 'Express adds security headers and a fresh CSP nonce. Its Fetch adapter passes that nonce through the RSC handler to the HTML renderer.',
    trace:
      'Express → createRequestListener\nentry.rsc.tsx → matchRSCServerRequest\nnonce → entry.ssr.tsx'
  },
  {
    label: 'Resolve',
    tool: 'React Router',
    icon: 'router',
    x: 340,
    y: 140,
    boundary: 'Server',
    file: 'app/routes.ts → route loaders',
    title: 'The URL finds its route.',
    body: 'The explicit Data Mode route configuration maps URLs to lazy modules. Loaders return data, actions handle mutations, and Server Components render into an RSC payload. Resource routes return responses.',
    trace:
      'routes.ts → lazy route module\nloader({ request, params })\nServer layout → theme'
  },
  {
    label: 'Prepare',
    tool: 'Redux',
    icon: 'redux',
    x: 340,
    y: 285,
    boundary: 'Server',
    file: 'app/root.client.tsx',
    title: 'This request gets its own store.',
    body: 'During SSR, the client layout creates a fresh Redux store. The server layout’s theme seeds its mode slice. The browser initializes its own store from the same data and preserves it across navigation.',
    trace:
      'Server layout → themeState\nLayout → useState(configureAppStore)\nProvider store={store} → document'
  },
  {
    label: 'Stream',
    tool: 'React',
    icon: 'react',
    x: 535,
    y: 285,
    boundary: 'Server',
    file: 'app/entry.ssr.tsx',
    title: 'The shell starts moving.',
    body: 'The SSR entry decodes the RSC payload and renderToReadableStream produces HTML. Browsers receive the ready shell while async Server Components finish. Bots and requests without a user agent wait for all content.',
    trace:
      'RSC payload → RSCStaticRouter\nrenderToReadableStream → HTML\nResponse → ready shell + deferred content'
  },
  {
    label: 'Transfer',
    tool: 'State',
    icon: 'vitex',
    x: 675,
    y: 180,
    boundary: 'Shared contract',
    file: 'HTML + RSC payload',
    title: 'The state comes along.',
    body: 'The streamed RSC payload carries loader data, server-rendered elements, and references to Client Components. The root theme initializes Redux; the document nonce stays with the HTML render.',
    trace:
      'matchRSCServerRequest → RSC payload\nrouteRSCServerRequest → HTML + payload\nServer layout theme → initial Redux state'
  },
  {
    label: 'Hydrate',
    tool: 'React',
    icon: 'react',
    x: 865,
    y: 180,
    boundary: 'Browser',
    file: 'app/entry.client.tsx',
    title: 'The page becomes yours.',
    body: 'The browser decodes the embedded RSC stream and hydrates RSCHydratedRouter. Client Components attach behavior to the server’s markup. Later navigations fetch RSC payloads while the layout keeps its Redux store.',
    trace:
      'getRSCStream → createFromReadableStream\nstartTransition → hydrateRoot(document, …)\nRSCHydratedRouter → client layout + UI'
  }
] as const;
const PATHS = [
  'M145 140 H340',
  'M340 140 V285',
  'M340 285 H535',
  'M535 285 H590 V180 H675',
  'M675 180 H865'
];

export const RequestJourney = () => {
  const { ref, reduced, running, paused, setPaused } = useShowcaseMotion();
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[selected] ?? STEPS[0];
  const islandXRay = useIslandXRay('steps through one request');

  useEffect(() => {
    if (!playing || !running) return;
    const timer = window.setTimeout(() => {
      if (selected === STEPS.length - 1) setPlaying(false);
      else setSelected(selected + 1);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [playing, running, selected]);

  return (
    <section
      ref={ref}
      className={styles.section}
      aria-labelledby="request-journey-title"
      {...islandXRay}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Inside the application</p>
          <h2 id="request-journey-title">Follow a single request.</h2>
          <p>One round trip. Every handoff, in view.</p>
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.send}
            onClick={() => {
              setSelected(reduced ? 5 : 0);
              setPaused(false);
              setPlaying(!reduced);
            }}>
            {playing ? '↻ Restart request' : '↗ Send a request'}
          </button>
          {playing && !reduced && (
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              aria-label={
                paused ? 'Resume request animation' : 'Pause request animation'
              }>
              {paused ? 'Play' : 'Pause'}
            </button>
          )}
        </div>
      </div>
      <div className={styles.figure}>
        <div className={styles.map} aria-hidden="true">
          <svg viewBox="0 0 1000 390" fill="none" aria-hidden="true">
            <rect
              x="40"
              y="54"
              width="560"
              height="312"
              className={styles.serverLane}
            />
            <rect
              x="610"
              y="54"
              width="135"
              height="312"
              className={styles.sharedLane}
            />
            <rect
              x="765"
              y="54"
              width="195"
              height="312"
              className={styles.clientLane}
            />
            <text x="65" y="82" className={styles.laneLabel} data-lane="server">
              01 / SERVER
            </text>
            <text x="625" y="82" className={styles.laneLabel}>
              02 / TRANSFER
            </text>
            <text
              x="790"
              y="82"
              className={styles.laneLabel}
              data-lane="client">
              03 / BROWSER
            </text>
            {PATHS.map((d, i) => (
              <g key={d}>
                <path d={d} className={styles.track} />
                <motion.path
                  d={d}
                  className={styles.trail}
                  initial={false}
                  animate={{ pathLength: selected > i ? 1 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.6 }}
                />
              </g>
            ))}
            {STEPS.map((item, i) => (
              <g key={item.label} transform={`translate(${item.x} ${item.y})`}>
                <motion.g
                  initial={false}
                  animate={{ y: selected === i && !reduced ? -10 : 0 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 20 }}>
                  <path
                    d="M-62 0 0-34 62 0v12L0 46-62 12Z"
                    className={styles.tileEdge}
                    data-active={selected === i}
                  />
                  <path
                    d="M-62 0 0-34 62 0 0 34Z"
                    className={styles.tile}
                    data-active={selected === i}
                  />
                  <g
                    transform="translate(-15 -17)"
                    className={styles.icon}
                    data-active={selected === i}>
                    <TechnologyIcon kind={item.icon} width={30} height={30} />
                  </g>
                </motion.g>
                <text
                  y="66"
                  className={styles.toolLabel}
                  data-boundary={item.boundary}>
                  {item.tool}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <fieldset className={styles.steps} aria-label="Request steps">
          {STEPS.map((item, i) => (
            <button
              key={item.label}
              type="button"
              data-boundary={item.boundary}
              aria-pressed={selected === i}
              onClick={() => {
                setSelected(i);
                setPlaying(false);
              }}>
              <span>0{i + 1}</span>
              {item.label}
            </button>
          ))}
        </fieldset>
        <div
          className={styles.detail}
          aria-live={playing ? 'off' : 'polite'}
          aria-atomic="true">
          <div className={styles.file}>
            <span
              className={styles.boundaryLabel}
              data-boundary={step.boundary}>
              {step.boundary}
            </span>
            <code>{step.file}</code>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={styles.sourceTrace}>
          <span className={styles.traceLabel}>
            Function trace / {step.label.toLowerCase()}
          </span>
          <pre>{step.trace}</pre>
        </div>
        <p className={styles.caption}>
          Illustrated RSC + SSR request · Select a step to inspect its boundary.
        </p>
      </div>
    </section>
  );
};
