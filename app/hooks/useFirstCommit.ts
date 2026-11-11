import { useEffect, useState, useSyncExternalStore } from 'react';

// The moment React finished hydrating the first page of this visit, in ms
// since the navigation started. The first effect records it once; effects of
// one commit run together, so every component of that commit sees the same
// moment. A component created later, after a client navigation, is told so.
let firstCommitAt: number | null = null;
let firstCommitDone = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const record = () => {
  if (firstCommitAt !== null || firstCommitDone) return;
  firstCommitAt = Math.round(performance.now());
  queueMicrotask(() => {
    firstCommitDone = true;
  });
  for (const listener of listeners) listener();
};

export const useFirstCommit = () => {
  // Decided once, while rendering: true only for a component created after
  // the first page hydrated. On the server and while hydrating it is false.
  const [late] = useState(
    () => typeof window !== 'undefined' && firstCommitDone
  );
  const at = useSyncExternalStore(
    subscribe,
    () => firstCommitAt,
    () => null
  );
  useEffect(record, []);
  return { at: late ? null : at, late };
};
