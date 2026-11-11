'use client';

import { clsx } from 'clsx';

import { useAppDispatch, useAppSelector } from '@/store/index';
import { FLAGS, selectFlags, setFlag } from '@/store/modules/Story';

import * as styles from './controls.module.css';

import type { ReactNode } from 'react';

import type { Flag } from '@/store/modules/Story';

// The controls of the story's panels: a row of choices and the flags of
// `vitex create`. They look like a terminal's: square, monospace, and the
// chosen one in inverse video.

type Option<Value extends string> = {
  value: Value;
  label: string;
};

type ChoiceProps<Value extends string> = {
  /** What is being chosen, for a reader who cannot see it. */
  label: string;
  options: readonly Option<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  /** Smaller, for the bar of a panel. */
  compact?: boolean;
};

/** One of a few choices, as a row of buttons. */
export const Choice = <Value extends string>({
  label,
  options,
  value,
  onChange,
  compact = false
}: ChoiceProps<Value>) => (
  <div
    className={clsx(styles.row, compact && styles.compact)}
    role="group"
    aria-label={label}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={styles.choice}
        aria-pressed={option.value === value}
        onClick={() => onChange(option.value)}>
        {option.label}
      </button>
    ))}
  </div>
);

/** A small button for the bar of a panel. */
export const PanelButton = ({
  onClick,
  pressed,
  children
}: {
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) => (
  <button
    type="button"
    className={styles.button}
    aria-pressed={pressed}
    onClick={onClick}>
    {children}
  </button>
);

const HUE: Partial<Record<Flag, string | undefined>> = {
  demo: styles.demo,
  postgres: styles.postgres
};

/**
 * The flags of `vitex create`, as checkboxes. They are one state for the whole
 * demo, kept in the Redux store.
 */
export const Flags = ({
  label,
  only = FLAGS
}: {
  label: string;
  /** The flags to offer; all of them when left out. */
  only?: readonly Flag[];
}) => {
  const flags = useAppSelector(selectFlags);
  const dispatch = useAppDispatch();
  return (
    <fieldset className={styles.row}>
      <legend className="sr-only">{label}</legend>
      {only.map((flag) => (
        <label key={flag} className={clsx(styles.flag, HUE[flag])}>
          <input
            type="checkbox"
            className="sr-only"
            checked={flags[flag]}
            onChange={(event) =>
              dispatch(setFlag({ flag, on: event.target.checked }))
            }
          />
          <span>--{flag}</span>
        </label>
      ))}
    </fieldset>
  );
};
