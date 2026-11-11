<h1>pum v.0.1.0</h1>
<p>
<img
  src="https://img.shields.io/badge/bundle-vite-black?style=for-the-badge&logo=vite"
  alt="bundle vite"
  height="25"
/>
<img
  src="https://img.shields.io/badge/node-lts-black?style=for-the-badge&logo=node.js"
  alt="node lts"
  height="25"
/>
<img
  src="https://img.shields.io/badge/react-@latest-black?style=for-the-badge&logo=react"
  alt="react latest"
  height="25"
/>
<img
  src="https://img.shields.io/badge/typescript-@latest-black?style=for-the-badge&logo=typescript"
  alt="typescript latest"
  height="25"
/>
<img
  src="https://img.shields.io/badge/tsrs-@latest-black?style=for-the-badge&logo=typescript"
  alt="tsrs latest"
  height="25"
/>
</p>

## Introduction

> Universal React with server-side rendering and Node.js

## Table of Contents

- [Stack](#stack)
- [Building blocks](#building-blocks)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Production](#production)
- [Template updates](#template-updates)
- [Additional Notes](#additional-notes)

## Stack

- Vite
- TypeScript, checked by tsrs
- Express
- React
- React Router RSC Data Mode (Server Components + streaming SSR)
- Redux
- Motion
- React Compiler
- Oxlint
- Oxfmt
- Stylelint
- Vitest
- CSS Modules

The runtime has three entries: `app/entry.rsc.tsx` renders Server Components,
`app/entry.ssr.tsx` streams HTML, and `app/entry.client.tsx` hydrates the browser.
Routes are declared in `app/routes.ts`. Interactive modules use `'use client'`;
server-only modules import `server-only`. Loader and action types are inferred
from the route exports without Framework Mode type generation.

React Router’s RSC APIs are experimental. React, React DOM, React Router, and
the RSC plugin use `^` ranges, and `package-lock.json` locks their tested
versions; upgrade them together and verify the upgrade.
Run `npm run lint`, `npm run build`, and `npm test` to check the project.

## Building blocks

- `app/config/site.ts`: the app's identity: its title, description, source
  link and language.
- `app/styles`: the design system, documented in
  `app/styles/README.md`: tokens, a light and dark theme with Vitex red as
  the accent to replace, the reset and the breakpoints.
- `app/components/VitexLogo` and `public/`: the logo on the home page and
  the favicons, until you replace them with your own.
- `app/components/AppShell`: the frame around every page; add the header
  and footer here.
- `app/components/ErrorBoundary`: the error page, also for unknown URLs.
- `app/components/Image`: a blur-up image, simple or responsive.
- `app/components/Loading`: an accessible loading state.
- `app/components/ThemeSwitcher`: the light and dark switch, ready to place.
- `app/hooks`: `useDarkMode`, the theme state behind the switch, kept in a
  signed session cookie.

## Installation

### Clone this repo:

```bash
$ git clone https://github.com/jetmirshatri/pum.git
$ cd pum
```

### Install the dependencies:

```bash
$ npm install
```

The generator creates ignored `.dev.env` and `.prod.env` files. After
cloning an existing project, copy `.dev.env.example` and
`.prod.env.example` when those local files are absent.

## Development

### Start the development server running on _localhost:3001_ with HMR enabled:

```bash
$ npm run dev
```

## Testing

`npm test` runs the Vitest unit tests in `app/**/*.test.ts(x)`, then the
runtime checks in `scripts/check-*.mjs` against the production build, so
build first. `npm run test:unit` reruns the unit tests on every change.

```bash
$ npm run build
$ npm test
```

## Production

### Generate the production build:

```bash
$ npm run build
```

### Start the application in a production environment:

```bash
$ npm start
```

## Template updates

`vitex update` keeps the template's infrastructure current: `server.js`,
`vite.config.ts`, the configuration files in the project root, `scripts/`
and the template's package fields. `app/`, `public/` and `drizzle/` are
yours after `vitex create`; updates never change them.

```bash
$ vitex update --dry-run
$ vitex update
$ npm install
```

Locally modified template files are never overwritten unless you pass
`--force`. Existing files receive timestamped `.bak-*` backups.
`vitex add postgres` adds PostgreSQL through Drizzle later and applies
pending template updates with it.

## Additional Notes

Set a strong `SESSION_SECRET` in the production environment before running
`npm start` or deploying the application.

`.github/workflows/ci.yml` runs lint, build and the tests on pushes to
`main` or `master` and on pull requests, with the Node version from
`.nvmrc`. `.vscode/` recommends the Oxc, Stylelint and TypeScript 7
extensions and points the TypeScript 7 extension at `tsrs`.

## Demos

This project was created with `--demo`. The home page tells the story of a
Vitex project as you scroll: what `create` writes, the template and its
overlays, who owns which file, how an update goes, the path of a request and
the three Vite environments. Its figures follow the scroll, its terminals and
flags are live, and its editors open this project's own files. The pages
under `/demo` show the template at work: the architecture, the CLI workflow,
streaming Server Components, optimistic actions and typed routes. Every page
is a Server Component with client islands inside it; the X-ray switch in the
header outlines which part is which and when each island hydrated.
`app/routes/demo.routes.ts` declares the pages, `app/config/navigation.ts`
links them from the header, the footer and the 404 page, and
`scripts/check-demo.mjs` checks them in `npm test`. `app/components/AppShell`
adds the header, the footer and the status line, and `app/styles/theme.css`
gives the demo its paper-and-ink theme in place of the default one. Create a
project without `--demo` for a clean start.
