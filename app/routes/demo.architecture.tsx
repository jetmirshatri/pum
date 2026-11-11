import * as motion from 'motion/react-client';

import { ArchitectureScene } from '@/components/ArchitectureScene/ArchitectureScene';
import { MotionLink, MotionUser } from '@/components/Motion/Motion';
import { RequestJourney } from '@/components/RequestJourney/RequestJourney';
import { RouteNavigation } from '@/components/RouteNavigation/RouteNavigation';
import { SystemConnections } from '@/components/SystemConnections/SystemConnections';
import { xray } from '@/components/XRay/xray';
import { FADE_UP, SPRING_SNAPPY } from '@/utils/motion';

import * as styles from './demo.architecture.module.css';
import { PrefetchCli } from './demo.architecture.view';

export { meta } from './demo.architecture.view';

// The page is a Server Component; the three scenes are client islands.
export default function ArchitectureRoute() {
  return (
    <MotionUser>
      <div className={styles.page}>
        <section className={styles.hero}>
          <motion.div
            className={styles.heroCopy}
            variants={FADE_UP}
            initial="hidden"
            animate="visible"
            {...xray('server', 'its code stays on the server')}>
            <p className={styles.eyebrow}>System architecture</p>
            <h1>One stack. Every connection.</h1>
            <p className={styles.lead}>
              Your source, your tools, your application. Follow the connections
              from the first CLI command to a running React app.
            </p>
            <MotionLink
              to="/demo/cli"
              prefetch="intent"
              className={styles.primaryLink}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING_SNAPPY}>
              Start at the CLI <span aria-hidden="true">→</span>
            </MotionLink>
          </motion.div>
          <div className={styles.flowPanel}>
            <ArchitectureScene />
          </div>
        </section>

        <RequestJourney />
        <SystemConnections />
        <RouteNavigation
          previous={{ to: '/', label: 'Back to overview' }}
          next={{ to: '/demo/cli', label: 'Open CLI workflow' }}
        />
        <PrefetchCli />
      </div>
    </MotionUser>
  );
}
