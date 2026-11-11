'use client';

import { clsx } from 'clsx';
import {
  motion,
  motionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring
} from 'motion/react';
import { createContext, useContext, useMemo, useRef, useState } from 'react';

import * as styles from './chapter.module.css';

import type { MotionStyle, MotionValue } from 'motion/react';
import type { ReactNode } from 'react';

// A chapter is the client half of the story's layout: it measures how far the
// reader has scrolled through it and writes that to --p, which the figure's
// CSS turns into movement. Its panels reach it through useChapter, to set a
// state the figure styles by, or to animate a custom property of their own.

type Property = `--${string}`;

type ChapterApi = {
  id: string;
  /** The scroll progress of the chapter, 0 to 1. */
  progress: MotionValue<number>;
  /** A custom property of the chapter that a panel may animate. */
  value: (name: Property) => MotionValue<number>;
  /** The states the figure styles by, as data-story-* attributes. */
  state: Readonly<Record<string, string>>;
  setState: (name: string, value: string) => void;
};

const ChapterContext = createContext<ChapterApi | null>(null);

export const useChapter = (): ChapterApi => {
  const chapter = useContext(ChapterContext);
  if (!chapter) throw new Error('useChapter needs a <Chapter> around it');
  return chapter;
};

type ChapterProps = {
  id: string;
  className?: string;
  /** The first chapter starts at the top of the page. */
  hero?: boolean;
  /** The progress to show while the scroll cannot drive it: on the server,
   * before hydration and under reduced motion. */
  rest: number;
  /** Custom properties that panels animate, with their first values. */
  values?: Readonly<Record<Property, number>>;
  /** The first states. */
  state?: Readonly<Record<string, string>>;
  head: ReactNode;
  figure: ReactNode;
  /** What the figure shows, for a reader who cannot see it. */
  label: string;
  /** The number and title under the figure: 'Fig. 4', 'update, planned'. */
  number: string;
  caption: string;
  /** A state whose value picks another caption. */
  captionBy?: string;
  captions?: Readonly<Record<string, string>>;
  /** The word before the percentage: 'explode'. */
  unit: string;
  children: ReactNode;
};

const percent = (value: number) =>
  String(Math.round(value * 100)).padStart(3, '0');

export const Chapter = ({
  id,
  className,
  hero = false,
  rest,
  values,
  state: firstState,
  head,
  figure,
  label,
  number,
  caption,
  captionBy,
  captions,
  unit,
  children
}: ChapterProps) => {
  const section = useRef<HTMLElement>(null);
  const readout = useRef<HTMLOutputElement>(null);
  const reduced = useReducedMotion() === true;

  const { scrollYProgress } = useScroll({
    target: section,
    offset: hero ? ['start start', 'end 0.55'] : ['start 0.62', 'end end']
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 30,
    restDelta: 0.0005
  });
  // The server renders the resting progress; the scroll takes over after
  // hydration, unless the reader asked for reduced motion.
  const progress = useMotionValue(rest);
  useMotionValueEvent(smooth, 'change', (value) => {
    if (reduced) return;
    progress.set(value);
    if (readout.current) readout.current.textContent = percent(value);
  });

  const [properties] = useState(() =>
    Object.fromEntries(
      Object.entries(values ?? {}).map(([name, first]) => [
        name,
        motionValue(first)
      ])
    )
  );
  const [state, setStates] = useState(firstState ?? {});

  const api = useMemo<ChapterApi>(
    () => ({
      id,
      progress,
      value: (name) => {
        const property = properties[name];
        if (!property) throw new Error(`Chapter ${id} has no value ${name}`);
        return property;
      },
      state,
      setState: (name, value) =>
        setStates((current) =>
          current[name] === value ? current : { ...current, [name]: value }
        )
    }),
    [id, progress, properties, state]
  );

  const picked = captionBy ? captions?.[state[captionBy] ?? ''] : undefined;

  return (
    <ChapterContext value={api}>
      <motion.section
        ref={section}
        id={id}
        className={clsx(styles.chapter, hero && styles.hero, className)}
        style={{ '--p': progress, ...properties } as MotionStyle}
        {...Object.fromEntries(
          Object.entries(state).map(([name, value]) => [
            `data-story-${name}`,
            value
          ])
        )}>
        <div className={styles.head}>{head}</div>
        <div className={styles.figure} role="img" aria-label={label}>
          {figure}
          <div className={styles.caption} aria-hidden="true">
            <span>
              {number} — {picked ?? caption}
            </span>
            <span>
              {unit} <output ref={readout}>{percent(rest)}</output>%
            </span>
          </div>
        </div>
        <div className={styles.beats}>{children}</div>
      </motion.section>
    </ChapterContext>
  );
};
