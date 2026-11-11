'use client';

import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { CHAPTERS } from '@/config/navigation';
import { useActiveChapter } from '@/hooks/useActiveChapter';
import { REPLAY_EVENT } from '@/hooks/useReplayKey';
import { useAppSelector } from '@/store/index';
import { createCommand, selectFlags } from '@/store/modules/Story';

import * as styles from './statusline.module.css';

const CELLS = 14;
const LAST = CHAPTERS.length - 1;

/** The reader's place on the page, in the block characters of a terminal. */
const useProgress = () => {
  const { scrollYProgress } = useScroll();
  const [cells, setCells] = useState(0);
  const [percent, setPercent] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setCells(Math.round(value * CELLS));
    setPercent(Math.round(value * 100));
  });
  return { cells, percent };
};

/**
 * On the home page: j and k (or the arrows) move between chapters, a digit
 * jumps to one, g and G go to the top and the end. The chapter's own panel
 * listens for r to replay.
 */
const useChapterKeys = (enabled: boolean, active: number) => {
  const reduced = useReducedMotion() === true;
  const position = useRef(active);
  useEffect(() => {
    position.current = active;
  }, [active]);

  useEffect(() => {
    if (!enabled) return undefined;
    const behavior = reduced ? 'auto' : 'smooth';
    const go = (index: number) => {
      const chapter = CHAPTERS[Math.max(0, Math.min(LAST, index))];
      if (chapter)
        document.getElementById(chapter.id)?.scrollIntoView({ behavior });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return;
      }
      const current = Math.min(position.current, LAST);
      if (event.key === 'j' || event.key === 'ArrowRight') go(current + 1);
      else if (event.key === 'k' || event.key === 'ArrowLeft') go(current - 1);
      else if (event.key === 'r') {
        dispatchEvent(
          new CustomEvent(REPLAY_EVENT, { detail: CHAPTERS[current]?.id })
        );
      } else if (event.key === 'g') scrollTo({ top: 0, behavior });
      else if (event.key === 'G') {
        scrollTo({ top: document.documentElement.scrollHeight, behavior });
      } else if (/^[0-7]$/.test(event.key)) go(Number(event.key));
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [enabled, reduced]);
};

/**
 * The status line at the bottom of every page: where the reader is, how far
 * down, and the command their flags describe. The flags come from the Redux
 * store, so the line shows the same command on every page.
 */
export const StatusLine = () => {
  const { pathname } = useLocation();
  const home = pathname === '/';
  const active = Math.min(useActiveChapter(), LAST);
  const { cells, percent } = useProgress();
  const command = createCommand(useAppSelector(selectFlags));
  useChapterKeys(home, active);

  return (
    <div className={styles.line} aria-hidden="true">
      <b className={styles.brand}>vitex</b>
      <span>
        {home ? `[${active}/${LAST}] ${CHAPTERS[active]?.name}` : pathname}
      </span>
      <span className={styles.bar}>
        {'█'.repeat(cells)}
        {'░'.repeat(CELLS - cells)} {String(percent).padStart(3, ' ')}%
      </span>
      <span className={styles.command}>$ {command}</span>
      {home && (
        <span className={styles.keys}>
          <kbd>j</kbd>
          <kbd>k</kbd> chapter · <kbd>1</kbd>–<kbd>7</kbd> jump · <kbd>r</kbd>{' '}
          replay · <kbd>g</kbd>
          <kbd>G</kbd> top / end
        </span>
      )}
    </div>
  );
};
