import { useInView, useReducedMotion } from 'motion/react';
import { useRef, useState, useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export const useMotionPreference = () => {
  const prefersReduced = useReducedMotion() === true;
  // Keep control labels identical during SSR and the first hydration render.
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot
  );
  return { hydrated, reduced: hydrated && prefersReduced };
};

export const useShowcaseMotion = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const { hydrated, reduced } = useMotionPreference();
  const [paused, setPaused] = useState(false);

  return {
    ref,
    reduced,
    paused,
    setPaused,
    running: hydrated && inView && !reduced && !paused
  };
};
