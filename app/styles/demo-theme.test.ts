import { describe, expect, it } from 'vitest';

import { contrast } from './contrast';

import type { Mode } from './contrast';

// The colours only the demo uses: the terminals, which stay dark in both
// themes, the hues the story gives a meaning, and the outlines and labels of
// the X-ray layer.

const surfaces = ['--surface-page', '--surface-raised', '--surface-sunken'];
const xray = ['--xray-server', '--xray-client', '--xray-suspense'];
const terminal = [
  '--v-terminal-text',
  '--v-terminal-muted',
  '--v-terminal-green',
  '--v-terminal-cyan',
  '--v-terminal-yellow',
  '--v-terminal-blue',
  '--v-terminal-red'
];
// A hue of the story is also the colour of a word, on the page and in a panel.
const story = [
  '--story-base',
  '--story-demo',
  '--story-postgres',
  '--story-yours',
  '--story-server',
  '--story-client',
  '--story-update',
  '--story-add'
];

// [foreground, background, minimum ratio]: 4.5 for text, 3 for outlines
// (WCAG 1.4.3 and 1.4.11).
const pairs: [string, string, number][] = [
  ...terminal.map((color): [string, string, number] => [
    color,
    '--v-terminal-bg',
    4.5
  ]),
  ...story.flatMap((color): [string, string, number][] => [
    [color, '--surface-page', 4.5],
    [color, '--surface-raised', 4.5]
  ]),
  // The current hop of a request is shown in inverse video.
  ['--surface-page', '--story-server', 4.5],
  ['--surface-page', '--story-client', 4.5],
  // The status line's brand, and a stamp on the page.
  ['--text-on-accent', '--accent', 4.5]
];
for (const color of xray) {
  pairs.push(['--xray-text', color, 4.5]);
  for (const surface of surfaces) pairs.push([color, surface, 3]);
}

describe.each<Mode>(['light', 'dark'])('the demo colours, %s', (mode) => {
  it.each(pairs)('%s on %s reaches %s:1', (foreground, background, minimum) => {
    const ratio = contrast(foreground, background, mode);
    expect(Math.floor(ratio * 100) / 100).toBeGreaterThanOrEqual(minimum);
  });
});
