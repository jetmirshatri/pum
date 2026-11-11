import * as styles from './loading.module.css';

import type { FC } from 'react';

export const Loading: FC = () => (
  <div className={styles.loading} role="status">
    <span className={styles.spinner} aria-hidden="true" />
    <span className="sr-only">Loading…</span>
  </div>
);
