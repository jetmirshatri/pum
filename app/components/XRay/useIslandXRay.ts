import { useFirstCommit } from '@/hooks/useFirstCommit';

import { xray } from './xray';

/** The X-ray attributes of a client island, with when it hydrated. */
export const useIslandXRay = (detail: string) => {
  const { at, late } = useFirstCommit();
  const timing = late
    ? ' · rendered in the browser'
    : at === null
      ? ''
      : ` · hydrated at ${at} ms`;
  return xray('client', `${detail}${timing}`);
};
