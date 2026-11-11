import { useEffect, useState } from 'react';

import { CHAPTERS, QUICKSTART_ID } from '@/config/navigation';

const SECTIONS = [...CHAPTERS.map((chapter) => chapter.id), QUICKSTART_ID];

/**
 * The index of the section of the home page the reader is in: a chapter of
 * CHAPTERS, or CHAPTERS.length for the quickstart that closes the page. A
 * section counts from the moment its top passes the middle of the window.
 */
export const useActiveChapter = (): number => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      let index = 0;
      SECTIONS.forEach((id, position) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top < innerHeight / 2) {
          index = position;
        }
      });
      setActive(index);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
    };
  }, []);

  return active;
};
