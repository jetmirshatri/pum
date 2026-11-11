'use client';

import { clsx } from 'clsx';
import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import * as styles from './terminal.module.css';

import type { CSSProperties, ReactNode } from 'react';

// A terminal that stays dark in both themes and speaks in the CLI's colours.
// It prints in one of two ways: over time, a command typed and its output
// arriving line by line, or with the scroll, each line appearing as --q (how
// far the run has printed, a custom property of the chapter) passes it.

export type Line = {
  /** A command: typed after the prompt. */
  command?: string;
  /** A line of output. */
  content?: ReactNode;
  /** ASCII art: its spaces are kept and its lines sit close. */
  art?: boolean;
  /** Milliseconds before it prints. */
  wait?: number;
};

type TerminalProps = {
  /** What it is, for a reader who cannot see it. */
  label: string;
  /** The directory in its title bar. */
  path: string;
  lines: readonly Line[];
  /** With the scroll, over time (then `run` starts and restarts it), or all
   * of it at once. */
  print?: 'scroll' | 'time' | 'all';
  run?: number;
  /** The rows it keeps room for, so the page does not jump while it prints. */
  rows?: number;
  /** A button for its title bar. */
  action?: ReactNode;
  className?: string;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const Row = ({ line, typed }: { line: Line; typed?: number }) =>
  line.command === undefined ? (
    <>{line.content ?? ' '}</>
  ) : (
    <>
      <span className={styles.red}>$</span>{' '}
      <b>{typed === undefined ? line.command : line.command.slice(0, typed)}</b>
      {typed !== undefined && <i className={styles.cursor} />}
    </>
  );

export const Terminal = ({
  label,
  path,
  lines,
  print = 'time',
  run = 0,
  rows,
  action,
  className
}: TerminalProps) => {
  const reduced = useReducedMotion() === true;
  // How many lines are printed, and how much of the command after them.
  const [printed, setPrinted] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (print !== 'time' || run === 0) return undefined;
    let current = true;
    const play = async () => {
      setPrinted(0);
      setTyped(0);
      for (const [index, line] of lines.entries()) {
        if (line.command !== undefined && !reduced) {
          for (let length = 1; length <= line.command.length; length += 1) {
            setTyped(length);
            await sleep(14);
            if (!current) return;
          }
          await sleep(240);
        } else if (!reduced) {
          await sleep(line.wait ?? 75);
        }
        if (!current) return;
        setPrinted(index + 1);
        setTyped(0);
      }
    };
    void play();
    return () => {
      current = false;
    };
  }, [lines, print, run, reduced]);

  const next = lines[printed];
  const typing = print === 'time' && next?.command !== undefined;

  return (
    <div
      className={clsx(styles.terminal, className)}
      role="group"
      aria-label={label}>
      <div className={styles.bar}>
        <b>terminal</b>
        <span>{path}</span>
        {action}
      </div>
      <pre
        className={clsx(styles.screen, print === 'scroll' && styles.scrolled)}
        style={{ '--rows': rows } as CSSProperties}>
        {(print === 'time' ? lines.slice(0, printed) : lines).map(
          (line, index) => (
            <span
              // The lines of one script keep their order.
              // oxlint-disable-next-line react/no-array-index-key
              key={index}
              className={clsx(styles.row, line.art && styles.art)}
              style={{ '--i': index } as CSSProperties}>
              <Row line={line} />
            </span>
          )
        )}
        {typing && next && (
          <span className={styles.row}>
            <Row line={next} typed={typed} />
          </span>
        )}
      </pre>
    </div>
  );
};

type Tone = 'green' | 'cyan' | 'yellow' | 'blue' | 'red' | 'muted';

/** Text in one of the CLI's colours. */
export const Ink = ({
  tone,
  bold = false,
  children
}: {
  tone: Tone;
  bold?: boolean;
  children: ReactNode;
}) => (
  <span className={clsx(styles[tone], bold && styles.bold)}>{children}</span>
);

/** The rounded box the CLI closes a command with. */
export const ResultBox = ({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) => (
  <span className={styles.result}>
    <Ink tone="green" bold>
      {title}
    </Ink>
    {children}
  </span>
);

/** A button in a terminal's title bar. */
export const TerminalButton = ({
  onClick,
  children
}: {
  onClick: () => void;
  children: ReactNode;
}) => (
  <button type="button" className={styles.button} onClick={onClick}>
    {children}
  </button>
);
