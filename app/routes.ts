import { demoRoutes } from './routes/demo.routes';

import type { unstable_RSCRouteConfig as RSCRouteConfig } from 'react-router';

export function routes(request: Request) {
  return [
    {
      id: 'root',
      path: '',
      lazy: async () => {
        const { createLayout, ...root } = await import('./root');
        return { ...root, Layout: createLayout(request) };
      },
      children: [
        { id: 'home', index: true, lazy: () => import('./routes/_index') },
        ...demoRoutes,
        {
          id: 'health',
          path: 'api/health',
          lazy: () => import('./routes/api.health')
        },
        {
          id: 'theme',
          path: 'theme/toggle',
          lazy: () => import('./routes/theme.toggle')
        },
        { id: 'not-found', path: '*', lazy: () => import('./routes/$') }
      ]
    }
  ] satisfies RSCRouteConfig;
}
