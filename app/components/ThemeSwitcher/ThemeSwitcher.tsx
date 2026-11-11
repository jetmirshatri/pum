import { useCallback } from 'react';
import { useFetcher } from 'react-router';

import { useDarkMode } from '@/hooks/DarkMode/useDarkMode';

import * as styles from './themeswitcher.module.css';

import type { ChangeEvent, FC } from 'react';

export const ThemeSwitcher: FC = () => {
  const { value, toggle } = useDarkMode();
  const fetcher = useFetcher();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.checked ? 'dark' : 'light';
      toggle();
      fetcher.submit(
        { theme: next },
        { method: 'POST', action: '/theme/toggle' }
      );
    },
    [toggle, fetcher]
  );

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>
        <input
          className="sr-only"
          type="checkbox"
          checked={value}
          onChange={onChange}
          aria-label={value ? 'Switch to light mode' : 'Switch to dark mode'}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb}>
            <span className={styles.sun}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
              </svg>
            </span>
            <span className={styles.moon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 15.3A8.5 8.5 0 0 1 8.7 4a8.5 8.5 0 1 0 11.3 11.3Z" />
              </svg>
            </span>
          </span>
        </span>
      </label>
    </div>
  );
};
