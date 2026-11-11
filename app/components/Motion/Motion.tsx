'use client';

import { MotionConfig, motion } from 'motion/react';
import { Link } from 'react-router';

import type { ReactNode } from 'react';

// Motion for Server Components. They render motion elements from
// motion/react-client; these two need a client module of their own.

/** Lets every motion element inside follow the visitor's reduced-motion setting. */
export const MotionUser = ({ children }: { children: ReactNode }) => (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
);

/** A router link that animates. */
export const MotionLink = motion.create(Link);
