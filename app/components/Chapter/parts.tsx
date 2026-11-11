import { clsx } from 'clsx';
import * as motion from 'motion/react-client';

import { xray } from '@/components/XRay/xray';
import { FADE_UP, IN_VIEW } from '@/utils/motion';

import * as styles from './chapter.module.css';

import type { ReactNode } from 'react';

// The text of a chapter. These are Server Components: the page writes its
// story with them and nothing of it ships as JavaScript.

const SERVER = xray('server', 'the text of the story stays on the server');

/** The line above a title: its number in red, then its name. */
export const Kicker = ({
  number,
  children
}: {
  number: string;
  children: ReactNode;
}) => (
  <p className={styles.kicker}>
    <b>{number}</b> {children}
  </p>
);

/** The title of a chapter; the first chapter's is the title of the page. */
export const Title = ({
  hero = false,
  children
}: {
  hero?: boolean;
  children: ReactNode;
}) =>
  hero ? (
    <h1 className={styles.heroTitle}>{children}</h1>
  ) : (
    <h2 className={styles.title}>{children}</h2>
  );

export const Lede = ({ children }: { children: ReactNode }) => (
  <p className={styles.lede} {...SERVER}>
    {children}
  </p>
);

/** A step of a chapter's text. It fades up when it scrolls into view. */
export const Beat = ({
  first = false,
  children
}: {
  /** The first beat follows the head closely. */
  first?: boolean;
  children: ReactNode;
}) => (
  <motion.div
    className={clsx(styles.beat, first && styles.beatFirst)}
    variants={FADE_UP}
    initial="hidden"
    whileInView="visible"
    viewport={IN_VIEW}
    {...SERVER}>
    {children}
  </motion.div>
);

/** A framed table of terms: pass <dt> and <dd> pairs. */
export const Spec = ({ children }: { children: ReactNode }) => (
  <dl className={styles.spec}>{children}</dl>
);

/** The dimension line beside a figure. It draws itself in view. */
export const Dim = ({ children }: { children: ReactNode }) => (
  <>
    <svg className={styles.dim} viewBox="0 0 12 380" aria-hidden="true">
      <motion.path
        d="M1 .5h10M6 .5v112M6 267v112M1 379.5h10"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={IN_VIEW}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </svg>
    <span className={styles.dimText}>{children}</span>
  </>
);
