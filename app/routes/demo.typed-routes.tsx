import { clsx } from 'clsx';
import * as motion from 'motion/react-client';
import { Link } from 'react-router';

import { MotionLink, MotionUser } from '@/components/Motion/Motion';
import { xray } from '@/components/XRay/xray';
import {
  CARD_REVEAL,
  FADE_UP,
  IN_VIEW,
  SPRING_SNAPPY,
  STAGGER_CONTAINER
} from '@/utils/motion';

import * as styles from './demo.typed-routes.module.css';
import { ModuleInspector } from './demo.typed-routes.view';

import type { LoaderFunctionArgs } from 'react-router';

type StackModule = {
  name: string;
  role: string;
  file: string;
  description: string;
};

const MODULES: Record<string, StackModule> = {
  1: {
    name: 'Vite Environment API',
    role: 'Compiler boundary',
    file: 'vite.config.ts',
    description:
      'Builds the browser, RSC, and SSR environments from one plugin-aware configuration.'
  },
  2: {
    name: 'React Router RSC Data Mode',
    role: 'Application boundary',
    file: 'app/routes.ts',
    description:
      'Coordinates explicit routes, server components, data loading, actions, and streamed rendering.'
  },
  3: {
    name: 'Express Runtime',
    role: 'Network boundary',
    file: 'server.js',
    description:
      'Owns HTTP concerns, security policy, static assets, logging, and the RSC request handler.'
  }
};

const NAV_IDS = ['1', '2', '3'] as const;

const CONTRACTS = [
  {
    name: 'params',
    detail: 'The loader validates the id before returning typed module data.'
  },
  {
    name: 'loaderData',
    detail: 'The component consumes the exact serializable value returned here.'
  },
  {
    name: 'error boundary',
    detail:
      'Unknown ids become a typed 404 response instead of a broken render.'
  }
] as const;

export { meta } from './demo.typed-routes.view';

// An unknown id is a 404 from the loader. This route shows the error page
// itself, so the page keeps the app's layout and its global styles.
export { default as ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';

export const loader = ({ params }: LoaderFunctionArgs) => {
  const id = params.id ?? '';
  const stackModule = MODULES[id];
  if (!stackModule) {
    throw new Response('Not Found', { status: 404 });
  }
  return { id, module: stackModule };
};

// The page is a Server Component that gets the loader's data as props; only
// the inspector, which animates between modules, is a client island.
export default function TypedRoutesRoute({
  loaderData
}: {
  loaderData: ReturnType<typeof loader>;
}) {
  const { id } = loaderData;
  return (
    <MotionUser>
      <div className={styles.page}>
        <section className={styles.hero}>
          <motion.div
            className={styles.heroCopy}
            variants={FADE_UP}
            initial="hidden"
            animate="visible"
            {...xray('server', "gets the loader's data as props")}>
            <p className={styles.eyebrow}>React Router / typed loader</p>
            <h1>The URL is part of the type system.</h1>
            <p className={styles.lead}>
              Change the route parameter below. The server validates it, the
              loader returns a typed module, and the UI transitions only after
              the next payload is ready.
            </p>
            <nav className={styles.moduleNav} aria-label="Stack module">
              {NAV_IDS.map((navId) => (
                <MotionLink
                  key={navId}
                  to={`/demo/routes/${navId}`}
                  aria-current={id === navId ? 'page' : undefined}
                  className={clsx(
                    styles.moduleLink,
                    id === navId && styles.moduleLinkActive
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING_SNAPPY}>
                  /{navId}
                </MotionLink>
              ))}
            </nav>
          </motion.div>

          <ModuleInspector {...loaderData} />
        </section>

        <section
          className={styles.contracts}
          {...xray('server', 'its code stays on the server')}>
          <motion.div
            className={styles.sectionHeading}
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={IN_VIEW}>
            <p className={styles.eyebrow}>Route contract</p>
            <h2>Params in. Typed data or a boundary out.</h2>
          </motion.div>
          <motion.div
            className={styles.contractGrid}
            variants={STAGGER_CONTAINER}
            initial="hidden"
            whileInView="visible"
            viewport={IN_VIEW}>
            {CONTRACTS.map((contract, index) => (
              <motion.article key={contract.name} variants={CARD_REVEAL}>
                <span>0{index + 1}</span>
                <code>{contract.name}</code>
                <p>{contract.detail}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <motion.section
          className={styles.boundaryTest}
          variants={FADE_UP}
          initial="hidden"
          whileInView="visible"
          viewport={IN_VIEW}
          {...xray('server', 'its code stays on the server')}>
          <div>
            <p className={styles.eyebrow}>Failure is a designed state</p>
            <h2>Send an unknown id through the same contract.</h2>
          </div>
          <Link to="/demo/routes/999">
            Test loader 404 <span aria-hidden="true">→</span>
          </Link>
        </motion.section>

        <div className={styles.routeLinks}>
          <MotionLink
            to="/"
            prefetch="intent"
            whileHover={{ x: -4 }}
            transition={SPRING_SNAPPY}>
            ← Back to overview
          </MotionLink>
          <MotionLink
            to="/demo/architecture"
            prefetch="intent"
            whileHover={{ x: 4 }}
            transition={SPRING_SNAPPY}>
            Return to architecture →
          </MotionLink>
        </div>
      </div>
    </MotionUser>
  );
}
