import { clsx } from 'clsx';

import * as styles from './iso.module.css';

import type { CSSProperties, ReactNode } from 'react';

// The parts of an isometric figure. They are plain markup: a figure moves
// them through custom properties, which iso.module.css turns into positions.
// A value is a number, or a calc() over the properties of the figure.

type Value = number | string;

/** Custom properties as a style, without the ones left undefined. */
export const vars = (
  properties: Record<`--${string}`, Value | undefined>
): CSSProperties =>
  Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );

type Part = {
  className?: string;
  /** More custom properties, for the mechanics of one figure. */
  style?: CSSProperties;
  children?: ReactNode;
};

/** The scene: everything in it is drawn in isometric projection. */
export const Scene = ({ className, children }: Part) => (
  <div className={clsx(styles.scene, className)}>{children}</div>
);

type LayerProps = Part & {
  /** Its height, in units. */
  z?: Value;
  /** The colour of its boxes, as a role: var(--story-demo). */
  tone?: string;
  /** How present its boxes are, 0 to 1. */
  o?: Value;
};

/** A group of boxes at one height. */
export const Layer = ({ className, children, z, tone, o }: LayerProps) => (
  <div
    className={clsx(styles.layer, className)}
    style={vars({ '--lz': z, '--c': tone, '--o': o })}>
    {children}
  </div>
);

type BoxProps = Part & {
  tone?: string;
  /** Its place and size on the plate, in cells from the centre. */
  x?: Value;
  y?: Value;
  w?: Value;
  h?: Value;
  /** Its height above the layer and its thickness, in units. */
  z?: Value;
  thick?: Value;
  /** A shift on the plate, in cells. */
  dx?: Value;
  dy?: Value;
  o?: Value;
  /** How strongly it is filled with its colour: '38%'. */
  fill?: string;
  /** A plate with a drawn grid. */
  grid?: boolean;
  /** A small box that sits on a plate. */
  brick?: boolean;
  dashed?: boolean;
};

/** A box with a front and a left wall. */
export const Box = ({
  className,
  style,
  children,
  tone,
  x,
  y,
  w,
  h,
  z,
  thick,
  dx,
  dy,
  o,
  fill,
  grid,
  brick,
  dashed
}: BoxProps) => (
  <div
    className={clsx(
      styles.box,
      grid && styles.grid,
      brick && styles.brick,
      dashed && styles.dashed,
      className
    )}
    style={{
      ...vars({
        '--c': tone,
        '--x': x,
        '--y': y,
        '--w': w,
        '--h': h,
        '--z': z,
        '--thick': thick,
        '--dx': dx,
        '--dy': dy,
        '--o': o,
        '--fill': fill
      }),
      ...style
    }}>
    {children}
  </div>
);

type TagProps = Part & {
  /** Where it stands from the corner of its box. */
  side?: 'right' | 'left' | 'front' | 'up';
  /** How visible it is, 0 to 1. */
  to?: Value;
  /** The colour of its dot, when not the colour of its box. */
  dot?: string;
  /** The colour of its text, when not the muted text colour. */
  color?: string;
};

/** A label that faces the reader. Put a <b> and a <small> in it. */
export const Tag = ({
  className,
  children,
  side,
  to,
  dot,
  color
}: TagProps) => (
  <span
    className={clsx(
      styles.tag,
      side === 'left' && styles.tagLeft,
      side === 'front' && styles.tagFront,
      side === 'up' && styles.tagUp,
      className
    )}
    style={{ ...vars({ '--to': to, '--tc': dot }), color }}>
    {children}
  </span>
);

/** Text that lies on a box. */
export const Lying = ({ children }: { children: ReactNode }) => (
  <span className={styles.lying}>{children}</span>
);

type PlumbProps = {
  className?: string;
  x: Value;
  y: Value;
  /** The height it hangs from and its length, in units. */
  z?: Value;
  len?: Value;
  to?: Value;
};

/** A dashed vertical line. */
export const Plumb = ({ className, x, y, z, len, to }: PlumbProps) => (
  <i
    className={clsx(styles.plumb, className)}
    style={vars({ '--x': x, '--y': y, '--z': z, '--len': len, '--to': to })}
  />
);

export const lyingLogo = styles.lyingLogo;
