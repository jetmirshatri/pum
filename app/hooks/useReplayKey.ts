import { useEffect, useEffectEvent } from 'react';

// The status line turns the r key into this event, with the id of the chapter
// the reader is in; the panel of that chapter replays what it shows.
export const REPLAY_EVENT = 'story:replay';

/** Calls replay when the reader presses r inside the chapter with this id. */
export const useReplayKey = (chapter: string, replay: () => void) => {
  const onReplay = useEffectEvent((event: Event) => {
    if (event instanceof CustomEvent && event.detail === chapter) replay();
  });
  useEffect(() => {
    addEventListener(REPLAY_EVENT, onReplay);
    return () => removeEventListener(REPLAY_EVENT, onReplay);
  }, []);
};
