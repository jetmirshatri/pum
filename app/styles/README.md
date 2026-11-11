# Design system

Four stylesheets hold the whole system; CSS Modules use it through `var()`.
Lint and tests enforce its rules, so a module that breaks one fails
`npm run lint` or `npm test`.

| File                    | Holds                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| `tokens.css`            | Scales: space, type, shape, sizes, layers, motion. No colour.        |
| `theme.css`             | Colours: the palette and the roles, for light and dark mode.         |
| `global.css`            | The reset, element defaults and utilities, in cascade layers.        |
| `mediaqueries.css`      | The breakpoints, as custom media.                                    |
| `design-system.test.ts` | Checks contrast in both themes and that every `var()` is declared.   |
| `contrast.ts`           | Reads the roles and measures WCAG contrast, for that test and yours. |

`app/root.tsx` imports `global.css`, which imports `tokens.css` and
`theme.css`. PostCSS makes the breakpoints of `mediaqueries.css` available in
every stylesheet, so they work without an import.

## Rules

Enforced:

- **Colours come from `theme.css`.** A module uses roles such as
  `var(--text-muted)`. Stylelint rejects hex values, named colours and colour
  functions in `*.module.css`; `color-mix()` of roles is allowed, for a
  one-off tint.
- **Breakpoints come from `mediaqueries.css`.** Stylelint rejects width and
  height media features in modules: write `@media (--md)`.
- **Layers come from `--v-z-*`.** Stylelint rejects any other `z-index`.
- **Every `var()` names a declared custom property**, in the stylesheets or as
  a `--name` style key in TSX. The test lists the ones that are not.
- **The colour roles meet WCAG AA in both themes** (see Contrast below).

Expected, not enforced:

- Sizes come from the scales: `--v-space-*` for gaps and padding,
  `--v-text-*` for type, `--v-radius-*`, `--v-size-*`. A raw value is for
  what no scale covers, such as the inside of an illustration.
- Use the palette (`--v-gray-*`, `--v-accent-*`, …) only for decoration that
  must look the same in both themes. Anything that is UI uses a role.
- A module with a transition or animation ends with a
  `@media (prefers-reduced-motion: reduce)` override.
- Controls are at least `--v-size-hit` (44px) in both directions, or extend
  their hit area with a pseudo-element.
- Leave focus to the global `:focus-visible` ring. A control that hides its
  input mirrors the ring with `:has(input:focus-visible)`.
- A list that drops its bullets gets `role="list"`: the reset removes the
  bullets and the padding, and the role keeps the list for screen readers.

## Tokens

`tokens.css`. The `--v-` prefix marks a token or a palette colour; roles have
none.

### Space

| Token | `1`  | `2` | `3`  | `4` | `5` | `6` | `7` | `8` | `9` | `10` |
| ----- | ---- | --- | ---- | --- | --- | --- | --- | --- | --- | ---- |
| `rem` | 0.25 | 0.5 | 0.75 | 1   | 1.5 | 2   | 3   | 4   | 6   | 8    |
| `px`  | 4    | 8   | 12   | 16  | 24  | 32  | 48  | 64  | 96  | 128  |

### Type

One ratio drives the scale. Step `n` is 16px × 1.2ⁿ on a 360px screen and
18px × 1.25ⁿ on a 1280px screen, linear in between and fixed outside. The
display sizes skip a step each, so a hero headline stands apart.

| Token           | Step |  360px |  1280px | For                |
| --------------- | ---: | -----: | ------: | ------------------ |
| `--v-text-xs`   |   -2 | 11.1px |  11.5px | labels, fine print |
| `--v-text-sm`   |   -1 | 13.3px |  14.4px | secondary text, UI |
| `--v-text-base` |    0 |   16px |    18px | body               |
| `--v-text-lg`   |    1 | 19.2px |  22.5px | lead text, `h4`    |
| `--v-text-xl`   |    2 |   23px |  28.1px | `h3`               |
| `--v-text-2xl`  |    3 | 27.6px |  35.2px | `h2`               |
| `--v-text-3xl`  |    4 | 33.2px |  43.9px | `h1`               |
| `--v-text-4xl`  |    6 | 47.8px |  68.7px | display            |
| `--v-text-5xl`  |    8 | 68.8px | 107.3px | hero               |

To change the scale, change the four numbers in the formula and recompute
each `clamp(min, intercept + slope·vw, max)`: slope is (max − min) / (1280 − 360) in px, intercept is min − slope × 360.

Fonts are system stacks: `--v-font-sans` and `--v-font-mono`. A web font must
be self-hosted: the CSP allows fonts from the app's own origin only. Leading:
`--v-leading-tight` 1, `-heading` 1.2, `-body` 1.6, `-relaxed` 1.75. Weights
`--v-weight-regular` 400 to `--v-weight-extrabold` 800. Tracking:
`--v-tracking-tight` and `-heading` for display sizes, `-label` for uppercase
labels.

### Shape, sizes, layers, motion

- Radius: `sm` 0.5rem, `md` 0.75rem, `lg` 1rem, `xl` 1.5rem, `full`.
- Border widths: `--v-border-hairline` 1px, `--v-border-emphasis` 2px.
- Widths: `--v-size-content` 78rem, `-wide` 56rem, `-prose` 42rem,
  `-compact` 32rem. Hit area `--v-size-hit` 2.75rem. Icons `sm` 1rem, `md`
  1.5rem, `lg` 2rem.
- Layers: `below` -1, `base` 0, `raised` 1, `floating` 10 (sticky bars),
  `overlay` 1000 (dialogs), `critical` 99999 (the skip link).
- Motion: durations `fast` 150ms, `base` 300ms, `slow` 500ms; easings
  `standard`, `out` (enter and settle) and `spring` (a small overshoot).

## Theme

### Light and dark

Each role holds both of its values in `light-dark(light, dark)`, and the
`color-scheme` of `<html>` picks one:

- No class: the reader's system setting, also without JavaScript.
- `html.light` or `html.dark`: the reader's choice.
  `app/components/ThemeSwitcher`, once you place it (in `AppShell`, for
  example), sets the class through `useDarkMode` and stores the choice in
  `localStorage` and in the signed session cookie, so the server renders the
  class on the next visit and the page never flashes the wrong theme.

The production build compiles `light-dark()` for browsers without it: Lightning
CSS, Vite's CSS minifier, turns each role into two variables that the
`color-scheme` rules switch. PostCSS leaves the function alone
(`"light-dark-function": false` in `.postcssrc.json`): its fallback would
declare every role again on every element.

### Roles

| Role                                  | Light                | Dark                 | For                                |
| ------------------------------------- | -------------------- | -------------------- | ---------------------------------- |
| `--surface-page`                      | gray 50              | gray 900             | the page                           |
| `--surface-raised`                    | white                | gray 800             | cards, popovers, inputs            |
| `--surface-sunken`                    | gray 100             | gray 950             | wells, code, table stripes         |
| `--surface-overlay`                   | page at 85%          | page at 85%          | translucent bars over content      |
| `--text-primary`                      | gray 900             | gray 50              | body text, headings                |
| `--text-muted`                        | gray 600             | gray 300             | secondary text                     |
| `--text-faint`                        | gray 500             | gray 400             | captions, placeholders             |
| `--text-accent`                       | accent 700           | accent 400           | text in the accent colour          |
| `--text-on-accent`                    | gray 950             | gray 950             | text on `--accent`                 |
| `--accent`                            | accent 500           | accent 500           | primary buttons, selected states   |
| `--accent-hover`, `--accent-active`   | accent 400/500       | accent 400/500       | their pointer states               |
| `--accent-subtle-bg`                  | accent at 10%        | accent at 10%        | tinted backgrounds                 |
| `--border-default`                    | gray 200             | gray 700             | dividers, card edges               |
| `--border-strong`                     | gray 400             | gray 500             | edges of controls, 3:1 at least    |
| `--border-accent`                     | accent 500           | accent 500           | selected edges                     |
| `--link`, `--link-hover`              | accent 700/800       | accent 400/300       | links                              |
| `--danger`, `--success`, `--warning`  | 800/700/700          | 300/400/400          | status text and icons              |
| `--danger-subtle-bg` (and the rest)   | status at 12%        | status at 12%        | the background of a status message |
| `--focus-ring`, `--focus-halo`        | border accent, page  | border accent, page  | the focus outline and its gap      |
| `--selection-bg`, `--selection-text`  | accent 500, gray 950 | accent 500, gray 950 | selected text                      |
| `--shadow-raised`, `--shadow-overlay` | black 8%/14%         | black 40%/60%        | elevation                          |

The accent is Vitex red, `#ff0000` (accent 500), the red of the logo. White
text on it reaches only 4:1, so text on the accent is near-black, and text in
the accent colour uses a darker red in light mode and a lighter one in dark
mode. Danger is a darker carmine, so an error and the accent are close in
hue: show errors with text or an icon as well, never with colour alone.

### Contrast

`design-system.test.ts` reads `theme.css`, resolves every role in both themes
and checks, with the WCAG formula:

- 4.5:1 for every text role on every surface, for `--text-on-accent` on the
  accent and its states, for selected text, and for text and status colours
  on their tints. A tint is measured on the page.
- 3:1 for `--border-strong`, `--focus-ring` and `--accent` on every surface:
  the edge of a control, the focus ring and a filled button must stand out
  (WCAG 1.4.11).

### Rebranding

Replace the accent ramp in the palette with your brand's, and the grays if you
like, then run `npm test`. A failing pair names the role and the surface:
pick a darker or lighter step for that role and run it again. Add a role,
never a raw colour in a module, when the design needs a new job for a colour,
and add its pairs to the test.

## Breakpoints

`mediaqueries.css`, in em so they follow the reader's font size:

| Query  | From           | Under: `--below-*` |
| ------ | -------------- | ------------------ |
| `--xs` | 30em, 480px    | `--below-xs`       |
| `--sm` | 37.5em, 600px  | `--below-sm`       |
| `--md` | 56.25em, 900px | `--below-md`       |
| `--lg` | 75em, 1200px   | `--below-lg`       |

Write the small screen first and add from a width up: `@media (--md)`. Keep
`--below-*` for the few rules that only apply on small screens.
`app/components/Image` repeats these widths in its `<source media>`
queries; change both together.

## Global styles

`global.css` declares three cascade layers, `reset`, `base` and `utilities`.
Unlayered CSS beats every layer, so a module always wins over them, whatever
its specificity.

- `reset`: `box-sizing: border-box`, no default margins, `role="list"` lists
  without bullets or padding, fieldsets without the browser's frame, media
  that never overflows, and form controls that inherit the font.
- `base`: the page colours and `color-scheme`, body type, balanced headings,
  links, monospace code, the focus ring and the text selection.
- `utilities`: `.sr-only` (hidden on screen, read by screen readers),
  `.skip-link` (the first link on every page) and `.no-js` (the notice for
  visitors without JavaScript).

## Adding a token

1. Look for a role or token that already says what you mean.
2. If none does, add the token to `tokens.css`, or the role to `theme.css`
   with both its values, and its contrast pairs to the test.
3. Update this file, then run `npm run lint` and `npm test`.
