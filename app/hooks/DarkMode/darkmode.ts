import {
  CLASS_DARK,
  CLASS_LIGHT,
  MEDIA_QUERY,
  STORAGE_KEY
} from '@/hooks/DarkMode/constants';

// `init` is serialized via init.toString() and injected inline (see initScript
// below). It MUST reference only browser globals (document, window,
// localStorage, JSON), take all config through parameters, and contain no
// line comments or whitespace-bearing string literals — the /\s+/g collapse
// applied to the stringified body would corrupt them.
function init(
  storageKey: string,
  darkClass: string,
  lightClass: string,
  mediaQuery: string
) {
  const root = document.documentElement;
  if (
    root.classList.contains(darkClass) ||
    root.classList.contains(lightClass)
  ) {
    return;
  }
  const apply = (isDark: boolean) => {
    root.classList.add(isDark ? darkClass : lightClass);
  };
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(storageKey);
  } catch {}
  if (stored !== null) {
    try {
      apply(JSON.parse(stored) === true);
      return;
    } catch {}
  }
  apply(window.matchMedia ? window.matchMedia(mediaQuery).matches : false);
}

const args = [STORAGE_KEY, CLASS_DARK, CLASS_LIGHT, MEDIA_QUERY]
  .map((value) => JSON.stringify(value))
  .join(',');

export const initScript = `(${init.toString().replace(/\s+/g, ' ')})(${args});`;
