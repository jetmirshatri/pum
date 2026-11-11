import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import {
  CLASS_DARK,
  CLASS_LIGHT,
  MEDIA_QUERY,
  STORAGE_KEY
} from '@/hooks/DarkMode/constants';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/index';
import { setExplicitMode, setMode, toggleMode } from '@/store/modules/Mode';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const parseStoredBool = (value: string | null): boolean | null => {
  if (value === null) return null;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'boolean' ? parsed : null;
  } catch {
    return null;
  }
};

export function useDarkMode() {
  const darkMode = useAppSelector((state) => state.mode.dark);
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const isFirstRender = useRef(true);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      const hasExplicit = store.getState().mode.hasExplicit;
      if (hasExplicit) {
        root.classList.toggle(CLASS_DARK, darkMode);
        root.classList.toggle(CLASS_LIGHT, !darkMode);
        return;
      }
      let stored = null;
      try {
        stored = parseStoredBool(localStorage.getItem(STORAGE_KEY));
      } catch {}
      const domIsDark = root.classList.contains(CLASS_DARK);
      if (stored !== null) {
        // An explicit localStorage choice can exist even when the theme cookie
        // does not — mark the store explicit so a later OS scheme change cannot
        // silently override the user's saved preference. (Reached only when
        // hasExplicit is false, per the early return above.)
        dispatch(setExplicitMode(stored));
      } else if (domIsDark !== darkMode) {
        dispatch(setMode(domIsDark));
      } else if (
        !root.classList.contains(CLASS_DARK) &&
        !root.classList.contains(CLASS_LIGHT)
      ) {
        root.classList.add(darkMode ? CLASS_DARK : CLASS_LIGHT);
      }
      return;
    }

    root.classList.toggle(CLASS_DARK, darkMode);
    root.classList.toggle(CLASS_LIGHT, !darkMode);
  }, [darkMode, dispatch, store]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = parseStoredBool(event.newValue);
      if (next !== null) dispatch(setExplicitMode(next));
    };

    const mql = window.matchMedia(MEDIA_QUERY);
    const onSchemeChange = (event: MediaQueryListEvent) => {
      if (store.getState().mode.hasExplicit) return;
      dispatch(setMode(event.matches));
    };

    window.addEventListener('storage', onStorage);
    mql.addEventListener('change', onSchemeChange);

    return () => {
      window.removeEventListener('storage', onStorage);
      mql.removeEventListener('change', onSchemeChange);
    };
  }, [dispatch, store]);

  const toggle = useCallback(() => {
    const next = !darkMode;
    dispatch(toggleMode());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, [darkMode, dispatch]);

  return { value: darkMode, toggle };
}
