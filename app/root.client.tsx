'use client';

import { useContext, useState } from 'react';
import { Provider } from 'react-redux';
import { Links, Meta, ScrollRestoration } from 'react-router';

import { AppShell } from '@/components/AppShell/AppShell';
import { site } from '@/config/site';
import { initScript } from '@/hooks/DarkMode/darkmode';
import { configureAppStore } from '@/store/index';

import { NonceContext } from './nonce';

import type { LinksFunction, MetaFunction } from 'react-router';

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
];

export const meta: MetaFunction = () => [
  { title: site.title },
  ...(site.description
    ? [{ name: 'description', content: site.description }]
    : [])
];

export function Layout({
  children,
  theme
}: {
  children: React.ReactNode;
  theme: 'light' | 'dark' | null;
}) {
  const nonce = useContext(NonceContext);
  const [store] = useState(() =>
    configureAppStore(
      theme
        ? { mode: { dark: theme === 'dark', hasExplicit: true } }
        : undefined
    )
  );

  return (
    <Provider store={store}>
      <html
        lang={site.lang}
        className={theme ?? undefined}
        suppressHydrationWarning>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          {/* Same-origin external styles are allowed by style-src 'self'. */}
          <Links nonce={nonce} />
          <script
            nonce={nonce}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: initScript }}
          />
        </head>
        <body>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <noscript>
            <p className="no-js">
              Please enable JavaScript in your browser for a better experience.
            </p>
          </noscript>
          <AppShell>
            <main id="main" tabIndex={-1}>
              {children}
            </main>
          </AppShell>
          <ScrollRestoration nonce={nonce} />
        </body>
      </html>
    </Provider>
  );
}
