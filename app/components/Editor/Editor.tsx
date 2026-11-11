'use client';

import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

import * as styles from './editor.module.css';

import type { ReactNode } from 'react';

// An editor pane. It behaves as an editor does: a click opens a file at once
// and nothing types itself. The files come from the server as plain text.

export type Owner = 'you' | 'tpl' | 'both' | 'rec';

export type EditorFile = {
  path: string;
  code: string;
  /** The lines to mark, counted from 1. */
  marks: readonly number[];
  owner: Owner;
};

export type TreeRow = {
  label: string;
  /** The file it opens; a row without one is a directory. */
  path?: string;
  owner: Owner;
  depth?: number;
};

const OWNERS: Record<Owner, readonly [string, string]> = {
  you: ['yours', 'not in the manifest · vitex update never opens it'],
  tpl: [
    'template-managed',
    'hash in the manifest · updated while you leave it untouched'
  ],
  both: ['shared', 'template-owned fields are tracked · your entries are kept'],
  rec: ['the receipt', 'written by create · refreshed by every update']
};

const TOKENS =
  /(\/\/.*$|\/\*.*?\*\/)|('[^'\n]*'|"[^"\n]*"|`[^`\n]*`)|\b(import|export|default|const|async|await|function|return|type|typeof|satisfies|from|if|new)\b|\b(\d+)\b/g;

/** A line of code with its comments, strings, keywords and numbers coloured. */
const paint = (line: string): ReactNode[] => {
  const parts: ReactNode[] = [];
  let end = 0;
  for (const match of line.matchAll(TOKENS)) {
    const [text, comment, string, keyword] = match;
    if (match.index > end) parts.push(line.slice(end, match.index));
    parts.push(
      <span
        key={match.index}
        className={
          comment
            ? styles.comment
            : string
              ? styles.string
              : keyword
                ? styles.keyword
                : styles.number
        }>
        {text}
      </span>
    );
    end = match.index + text.length;
  }
  if (end < line.length) parts.push(line.slice(end));
  return parts;
};

type EditorProps = {
  /** What it shows, for a reader who cannot see it. */
  label: string;
  files: readonly EditorFile[];
  /** The path of the open file. */
  open: string;
  onOpen: (path: string) => void;
  /** A tree of files beside the code; without one the files are tabs. */
  tree?: readonly TreeRow[];
  /** Short names for the tabs, by path. */
  names?: Readonly<Record<string, string>>;
  /** Under the code: who owns the open file, and what an update does. */
  ownership?: boolean;
  /** The least number of rows of code to keep room for. */
  rows?: number;
};

export const Editor = ({
  label,
  files,
  open,
  onOpen,
  tree,
  names,
  ownership = false,
  rows = 0
}: EditorProps) => {
  const file = files.find((candidate) => candidate.path === open) ?? files[0];
  const code = useRef<HTMLPreElement>(null);
  const tabs = useRef<HTMLDivElement>(null);

  // A newly opened file starts at its top, with its tab in view.
  useEffect(() => {
    code.current?.scrollTo(0, 0);
    const tab = [...(tabs.current?.children ?? [])].find(
      (candidate): candidate is HTMLElement =>
        candidate instanceof HTMLElement && candidate.dataset.path === open
    );
    if (tab && tabs.current) tabs.current.scrollLeft = tab.offsetLeft - 24;
  }, [open]);

  if (!file) return null;
  const [owner, effect] = OWNERS[file.owner];
  const lines = file.code.split('\n');

  return (
    <div
      className={clsx(styles.editor, tree && styles.withTree)}
      role="group"
      aria-label={label}
      data-owner={file.owner}>
      {tree && (
        <ul className={styles.tree} role="list">
          {tree.map((row) => (
            <li key={row.label} data-owner={row.owner}>
              {row.path ? (
                <button
                  type="button"
                  className={clsx(styles.entry, row.depth && styles.nested)}
                  aria-pressed={row.path === file.path}
                  onClick={() => row.path && onOpen(row.path)}>
                  {row.label}
                </button>
              ) : (
                <span className={clsx(styles.entry, styles.directory)}>
                  {row.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.tabs} ref={tabs}>
        {tree ? (
          <span className={clsx(styles.tab, styles.title)}>{file.path}</span>
        ) : (
          files.map((candidate) => (
            <button
              key={candidate.path}
              type="button"
              className={styles.tab}
              data-path={candidate.path}
              aria-pressed={candidate.path === file.path}
              onClick={() => onOpen(candidate.path)}>
              {names?.[candidate.path] ?? candidate.path}
            </button>
          ))
        )}
      </div>
      {/* The code scrolls inside its pane, so it must be reachable by keyboard. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <pre className={styles.code} ref={code} tabIndex={0}>
        <code>
          {lines.map((line, index) => (
            <span
              // The lines of one file keep their order.
              // oxlint-disable-next-line react/no-array-index-key
              key={index}
              className={clsx(
                styles.line,
                file.marks.includes(index + 1) && styles.marked
              )}>
              {line ? paint(line) : ' '}
            </span>
          ))}
          {Array.from(
            { length: Math.max(0, rows - lines.length) },
            (_, row) => (
              <span
                key={`pad-${row}`}
                className={styles.pad}
                aria-hidden="true">
                {' '}
              </span>
            )
          )}
        </code>
      </pre>
      {ownership && (
        <p className={styles.owner}>
          <b>{owner}</b>
          <span>{effect}</span>
        </p>
      )}
    </div>
  );
};
