'use client';

import { PrefetchPageLinks } from 'react-router';

import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => [
  { title: 'Architecture | Vitex' },
  {
    name: 'description',
    content:
      'How the Vitex CLI, Vite, React Router, Redux, and Express work together.'
  }
];

/** Loads the CLI page ahead of the click: PrefetchPageLinks runs in the browser. */
export const PrefetchCli = () => <PrefetchPageLinks page="/demo/cli" />;
