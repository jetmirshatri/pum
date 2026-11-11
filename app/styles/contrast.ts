import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Reads the tokens and colour roles of app/styles and measures WCAG contrast.
// design-system.test.ts checks the roles with it; a test for roles of your
// own can use it too.

export type Mode = 'light' | 'dark';
type Rgba = [red: number, green: number, blue: number, alpha: number];

const styles = fileURLToPath(new URL('.', import.meta.url));
const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const tokens = new Map<string, string>();
for (const file of ['tokens.css', 'theme.css']) {
  const css = withoutComments(readFileSync(join(styles, file), 'utf8'));
  for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    if (name && value && !tokens.has(name)) tokens.set(name, value.trim());
  }
}

/** Splits a function's arguments at its top-level commas. */
const split = (inner: string) => {
  const parts = [''];
  let depth = 0;
  for (const char of inner) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) parts.push('');
    else parts[parts.length - 1] += char;
  }
  return parts.map((part) => part.trim());
};

/** `name(inner)` when one function call spans the whole value. */
const call = (value: string) => {
  const open = value.indexOf('(');
  if (open < 1) return undefined;
  let depth = 0;
  for (let index = open; index < value.length; index += 1) {
    if (value[index] === '(') depth += 1;
    if (value[index] === ')') depth -= 1;
    if (depth === 0) {
      return index === value.length - 1
        ? { name: value.slice(0, open), args: split(value.slice(open + 1, -1)) }
        : undefined;
    }
  }
  return undefined;
};

const hex = (value: string): Rgba | undefined => {
  const digits = /^#([\da-f]{3,8})$/i.exec(value)?.[1];
  if (!digits || digits.length === 5 || digits.length === 7) return undefined;
  const full =
    digits.length <= 4
      ? digits.replace(/./g, (digit) => digit + digit)
      : digits;
  const channel = (index: number) =>
    Number.parseInt(full.slice(index, index + 2), 16);
  return [
    channel(0),
    channel(2),
    channel(4),
    full.length === 8 ? channel(6) / 255 : 1
  ];
};

const number = (value: string) =>
  value.endsWith('%') ? Number.parseFloat(value) / 100 : Number(value);

/** rgb(r g b / a), rgb(r, g, b) and rgba(r, g, b, a). */
const rgb = (args: string[]): Rgba => {
  const [color = '', alpha] = args.join(' ').split('/');
  const [red = 0, green = 0, blue = 0, legacyAlpha] = color.trim().split(/\s+/);
  const opacity = alpha ?? legacyAlpha;
  return [
    Number(red),
    Number(green),
    Number(blue),
    opacity === undefined ? 1 : number(opacity.trim())
  ];
};

/** Paints `top` over `bottom`. */
const over = (top: Rgba, bottom: Rgba): Rgba => {
  const alpha = top[3] + bottom[3] * (1 - top[3]);
  const channel = (index: 0 | 1 | 2) =>
    alpha === 0
      ? 0
      : (top[index] * top[3] + bottom[index] * bottom[3] * (1 - top[3])) /
        alpha;
  return [channel(0), channel(1), channel(2), alpha];
};

/** The colour a value resolves to in a theme, as sRGB channels and alpha. */
export const resolve = (value: string, mode: Mode, depth = 0): Rgba => {
  if (depth > 32) throw new Error(`Circular reference in ${value}`);
  const color = value.trim();
  if (color === 'transparent') return [0, 0, 0, 0];
  const parsed = hex(color);
  if (parsed) return parsed;
  const fn = call(color);
  if (fn?.name === 'var') {
    const [name = '', ...fallback] = fn.args;
    const next = tokens.get(name) ?? (fallback.join(', ') || undefined);
    if (next === undefined) throw new Error(`${name} is not defined`);
    return resolve(next, mode, depth + 1);
  }
  if (fn?.name === 'light-dark') {
    const [light = '', dark = ''] = fn.args;
    return resolve(mode === 'light' ? light : dark, mode, depth + 1);
  }
  if (fn?.name === 'rgb' || fn?.name === 'rgba') return rgb(fn.args);
  if (fn?.name === 'color-mix') {
    const [space, ...colors] = fn.args;
    if (space !== 'in srgb' || colors.length !== 2) {
      throw new Error(`Only color-mix(in srgb, a, b) is supported: ${color}`);
    }
    const parts = colors.map((part) => {
      const match = /^(?:([\d.]+)%\s+)?(.*?)(?:\s+([\d.]+)%)?$/s.exec(part);
      const weight = match?.[1] ?? match?.[3];
      return {
        color: resolve(match?.[2] ?? part, mode, depth + 1),
        weight: weight === undefined ? undefined : Number(weight) / 100
      };
    });
    const [a, b] = parts as [(typeof parts)[0], (typeof parts)[0]];
    const weightA = a.weight ?? (b.weight === undefined ? 0.5 : 1 - b.weight);
    const weightB = b.weight ?? 1 - weightA;
    const total = weightA + weightB;
    const [wa, wb] = [weightA / total, weightB / total];
    const alpha = a.color[3] * wa + b.color[3] * wb;
    const channel = (index: 0 | 1 | 2) =>
      alpha === 0
        ? 0
        : (a.color[index] * a.color[3] * wa +
            b.color[index] * b.color[3] * wb) /
          alpha;
    return [channel(0), channel(1), channel(2), alpha * Math.min(total, 1)];
  }
  throw new Error(`Cannot read the colour ${color}`);
};

const linear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = ([red, green, blue]: Rgba) => {
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
};

/** The WCAG contrast ratio of a role on another; tints sit on the page. */
export const contrast = (
  foreground: string,
  background: string,
  mode: Mode
) => {
  const page = resolve('var(--surface-page)', mode);
  const behind = over(resolve(`var(${background})`, mode), page);
  const front = over(resolve(`var(${foreground})`, mode), behind);
  const [lighter, darker] = [luminance(front), luminance(behind)].sort(
    (a, b) => b - a
  ) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
};
