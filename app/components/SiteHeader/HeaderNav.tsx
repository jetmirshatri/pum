'use client';

import { clsx } from 'clsx';
import { motion, useScroll, useSpring } from 'motion/react';
import { Link, NavLink, useLocation } from 'react-router';

import { CHAPTERS, PRIMARY_LINKS, QUICKSTART_ID } from '@/config/navigation';
import { useActiveChapter } from '@/hooks/useActiveChapter';

import * as styles from './siteheader.module.css';

// On the home page the header lists the chapters of the story and follows
// the reader through them; on every other page it lists the pages.

const ChapterLinks = () => {
  const active = useActiveChapter();
  return (
    <nav className={clsx(styles.nav, styles.chapters)} aria-label="Chapters">
      {CHAPTERS.slice(1).map(({ id, label }, index) => (
        <Link
          key={id}
          to={{ hash: `#${id}` }}
          className={clsx(
            styles.navLink,
            active === index + 1 && styles.navLinkActive
          )}
          aria-current={active === index + 1 ? 'location' : undefined}>
          {label}
        </Link>
      ))}
      <Link
        to={{ hash: `#${QUICKSTART_ID}` }}
        className={clsx(
          styles.cta,
          active === CHAPTERS.length && styles.ctaActive
        )}>
        Quickstart
      </Link>
    </nav>
  );
};

const PageLinks = () => (
  <nav className={clsx(styles.nav, styles.pages)} aria-label="Pages">
    {PRIMARY_LINKS.map(({ to, label, end, reloadDocument }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        reloadDocument={reloadDocument}
        prefetch="intent"
        className={({ isActive }) =>
          clsx(styles.navLink, isActive && styles.navLinkActive)
        }>
        {label}
      </NavLink>
    ))}
  </nav>
);

export const HeaderNav = () =>
  useLocation().pathname === '/' ? <ChapterLinks /> : <PageLinks />;

/** How far the reader is down the page, as a line under the header. */
export const HeaderProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.001
  });
  return (
    <motion.i
      className={styles.progress}
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
};
