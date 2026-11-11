import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { contrast, resolve } from './contrast';

import type { Mode } from './contrast';

// Checks the design system as app/styles defines it: the colour roles meet
// WCAG AA in both themes, and every var() names a custom property that exists.

const app = fileURLToPath(new URL('..', import.meta.url));
const read = (path: string) => readFileSync(join(app, path), 'utf8');

const surfaces = ['--surface-page', '--surface-raised', '--surface-sunken'];
const text = [
  '--text-primary',
  '--text-muted',
  '--text-faint',
  '--text-accent',
  '--link',
  '--link-hover',
  '--danger',
  '--success',
  '--warning'
];
const tints = [
  '--accent-subtle-bg',
  '--danger-subtle-bg',
  '--success-subtle-bg',
  '--warning-subtle-bg'
];

// [foreground, background, minimum ratio]: 4.5 for text, 3 for the edges of
// controls and for focus (WCAG 1.4.3 and 1.4.11).
const pairs: [string, string, number][] = [
  ...text.flatMap((role) =>
    surfaces.map((surface): [string, string, number] => [role, surface, 4.5])
  ),
  ['--text-on-accent', '--accent', 4.5],
  ['--text-on-accent', '--accent-hover', 4.5],
  ['--text-on-accent', '--accent-active', 4.5],
  ['--selection-text', '--selection-bg', 4.5],
  ...tints.map((tint): [string, string, number] => [
    '--text-primary',
    tint,
    4.5
  ]),
  ['--text-accent', '--accent-subtle-bg', 4.5],
  ['--danger', '--danger-subtle-bg', 4.5],
  ['--success', '--success-subtle-bg', 4.5],
  ['--warning', '--warning-subtle-bg', 4.5],
  ...surfaces.flatMap((surface): [string, string, number][] => [
    ['--border-strong', surface, 3],
    ['--focus-ring', surface, 3],
    ['--accent', surface, 3]
  ])
];

describe.each<Mode>(['light', 'dark'])('the %s theme', (mode) => {
  it('paints the page in an opaque colour', () => {
    expect(resolve('var(--surface-page)', mode)[3]).toBe(1);
  });

  it.each(pairs)('%s on %s reaches %s:1', (foreground, background, minimum) => {
    const ratio = contrast(foreground, background, mode);
    expect(Math.floor(ratio * 100) / 100).toBeGreaterThanOrEqual(minimum);
  });
});

describe('custom properties', () => {
  it('every var() names a custom property that is declared', () => {
    const files = readdirSync(app, {
      recursive: true,
      encoding: 'utf8'
    }).filter(
      (file) => /\.(css|tsx?)$/.test(file) && !/\.test\.tsx?$/.test(file)
    );
    const declared = new Set<string>();
    const used = new Map<string, string>();
    for (const file of files) {
      const source = read(file);
      for (const [, name] of source.matchAll(/(--[\w-]+)['"]?\s*:/g)) {
        if (name) declared.add(name);
      }
      for (const [, name] of source.matchAll(/var\(\s*(--[\w-]+)/g)) {
        if (name && !used.has(name)) used.set(name, file);
      }
    }
    const undeclared = [...used]
      .filter(([name]) => !declared.has(name))
      .map(([name, file]) => `${name} in ${file}`);
    expect(undeclared).toEqual([]);
  });
});
