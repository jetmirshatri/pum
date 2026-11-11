import 'server-only';

import { randomBytes } from 'node:crypto';

import { createCookieSessionStorage } from 'react-router';

type ThemeSession = { theme: 'light' | 'dark' };

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production');
  }
  console.warn(
    '[vitex] SESSION_SECRET not set — using an ephemeral per-process secret. Set SESSION_SECRET in .dev.env to persist sessions across restarts.'
  );
}

const secret = sessionSecret ?? randomBytes(32).toString('hex');

const storage = createCookieSessionStorage<ThemeSession>({
  cookie: {
    name: 'vitex_theme',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
    secrets: [secret]
  }
});

export const getThemeSession = (request: Request) =>
  storage.getSession(request.headers.get('Cookie'));

export const commitThemeSession = storage.commitSession;
export const destroyThemeSession = storage.destroySession;
