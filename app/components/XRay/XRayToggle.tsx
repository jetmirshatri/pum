'use client';

import { setXRay, useXRay } from './xray-store';
import * as styles from './xray.module.css';

/** Shows and hides where every part of the page renders. */
export const XRayToggle = () => {
  const on = useXRay();
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={on}
      onClick={() => setXRay(!on)}>
      <span className={styles.pill}>X-ray</span>
    </button>
  );
};

/** The key to the X-ray outlines, shown while the layer is on. */
export const XRayKey = () => {
  const on = useXRay();
  if (!on) return null;
  return (
    <aside className={styles.key} aria-label="X-ray key">
      <span data-xray-swatch="server">Server Component</span>
      <span data-xray-swatch="client">Client island</span>
      <span data-xray-swatch="suspense">Suspense boundary</span>
      <button type="button" onClick={() => setXRay(false)}>
        Close
      </button>
    </aside>
  );
};
