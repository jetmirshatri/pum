import { Outlet } from 'react-router';

import { Layout as ClientLayout } from './root.client';
import { getThemeSession } from './sessions.server';
import './styles/global.css';

import type { ReactNode } from 'react';

export { links, meta } from './root.client';

// Bind the request privately: route discovery also renders the error layout,
// outside React Router's request context. Document POSTs need their theme even
// when the router returns action data without loaders.
export function createLayout(request: Request) {
  return async function Layout({ children }: { children: ReactNode }) {
    const session = await getThemeSession(request);
    const storedTheme = session.get('theme');
    const theme =
      storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
    return <ClientLayout theme={theme}>{children}</ClientLayout>;
  };
}

export default function App() {
  return <Outlet />;
}

export { default as ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
