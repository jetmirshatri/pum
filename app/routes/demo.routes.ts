import type { unstable_RSCRouteConfig as RSCRouteConfig } from 'react-router';

// The demo pages: app/routes.ts mounts them next to the home page.
export const demoRoutes = [
  {
    id: 'architecture',
    path: 'demo/architecture',
    lazy: () => import('./demo.architecture')
  },
  { id: 'cli', path: 'demo/cli', lazy: () => import('./demo.cli') },
  {
    id: 'streaming',
    path: 'demo/streaming',
    lazy: () => import('./demo.streaming')
  },
  { id: 'actions', path: 'demo/actions', lazy: () => import('./demo.actions') },
  {
    id: 'typed-routes',
    path: 'demo/routes/:id',
    lazy: () => import('./demo.typed-routes')
  }
] satisfies RSCRouteConfig;
