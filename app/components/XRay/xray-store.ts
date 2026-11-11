import { useSyncExternalStore } from 'react';

// Whether the X-ray layer is on. It lives on <html data-xray>, so the CSS of
// every region can see it, and lasts until the page reloads.
const listeners = new Set<() => void>();
let on = false;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setXRay = (next: boolean) => {
  on = next;
  document.documentElement.toggleAttribute('data-xray', next);
  for (const listener of listeners) listener();
};

export const useXRay = () =>
  useSyncExternalStore(
    subscribe,
    () => on,
    () => false
  );
