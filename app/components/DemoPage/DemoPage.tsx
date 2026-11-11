import * as motion from 'motion/react-client';

import { MotionUser } from '@/components/Motion/Motion';
import { RouteNavigation } from '@/components/RouteNavigation/RouteNavigation';
import { xray } from '@/components/XRay/xray';
import { FADE_UP } from '@/utils/motion';

import * as styles from './demopage.module.css';

import type { ReactNode } from 'react';

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  previous: { to: string; label: string };
  next: { to: string; label: string };
  children: ReactNode;
};

/**
 * The frame of a demo page, as a Server Component: the heading, the page's
 * own content and the links to the pages before and after it.
 */
export const DemoPage = ({
  eyebrow,
  title,
  description,
  previous,
  next,
  children
}: Props) => (
  <MotionUser>
    <div className={styles.page}>
      <motion.header
        className={styles.header}
        variants={FADE_UP}
        initial="hidden"
        animate="visible"
        {...xray('server', 'its code stays on the server')}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
      </motion.header>
      <div className={styles.surface}>{children}</div>
      <RouteNavigation previous={previous} next={next} />
    </div>
  </MotionUser>
);
