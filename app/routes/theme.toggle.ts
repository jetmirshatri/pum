import { commitThemeSession, getThemeSession } from '../sessions.server';

import type { ActionFunctionArgs } from 'react-router';

export const loader = () => {
  throw new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' }
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // SameSite=Lax + Origin is an intentionally lightweight CSRF guard for this
  // theme-only route; a present-but-malformed or cross-origin Origin is
  // rejected. Sensitive actions should also treat a missing Origin as untrusted.
  const origin = request.headers.get('origin');
  if (origin) {
    let originUrl: URL;
    try {
      originUrl = new URL(origin);
    } catch {
      throw new Response('Forbidden', { status: 403 });
    }
    if (originUrl.origin !== new URL(request.url).origin) {
      throw new Response('Forbidden', { status: 403 });
    }
  }

  const formData = await request.formData();
  const requested = formData.get('theme');
  if (requested !== 'light' && requested !== 'dark') {
    throw new Response('Invalid theme', { status: 400 });
  }

  const session = await getThemeSession(request);
  session.set('theme', requested);

  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': await commitThemeSession(session) }
  });
};
