export const IN_VIEW = { once: true, margin: '-80px' } as const;

export const SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 400,
  damping: 20
} as const;

export const SPRING_STANDARD = {
  type: 'spring',
  stiffness: 260,
  damping: 22
} as const;

export const SPRING_GENTLE = {
  type: 'spring',
  stiffness: 220,
  damping: 14
} as const;

export const MOTION_DURATION = {
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
  pulse: 1.5,
  float: 4,
  glow: 6,
  marquee: 25
} as const;

export const MOTION_EASE = {
  standard: 'easeInOut',
  linear: 'linear'
} as const;

export const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_STANDARD
  }
} as const;

export const STAGGER_CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
} as const;

export const STAGGER_DELAYED = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
} as const;

export const TITLE_WORD = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_GENTLE
  }
} as const;

export const CARD_REVEAL = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_STANDARD
  }
} as const;
