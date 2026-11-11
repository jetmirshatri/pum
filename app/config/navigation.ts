// The links the header, the footer and the 404 page offer, and the chapters
// of the story on the home page. Add your routes here as you build them.
export type NavigationLink = {
  to: string;
  label: string;
  // Match only this exact path, for a link to an index route.
  end?: boolean;
  // Load the target as a document, for a resource route such as /api/health.
  reloadDocument?: boolean;
};

export type FooterGroup = {
  title: string;
  links: readonly NavigationLink[];
};

// A route the 404 page offers, and suggests when the requested path is close.
export type Destination = {
  path: string;
  name: string;
  description: string;
  symbol: string;
};

// A chapter of the home page: the id of its section, its label in the header
// and its name in the status line.
export type Chapter = {
  id: string;
  label: string;
  name: string;
};

export const CHAPTERS: readonly Chapter[] = [
  { id: 'top', label: 'Vitex', name: 'vitex' },
  { id: 'create', label: 'Create', name: 'create' },
  { id: 'compose', label: 'Compose', name: 'compose' },
  { id: 'own', label: 'Own', name: 'own' },
  { id: 'update', label: 'Update', name: 'update' },
  { id: 'route', label: 'Route', name: 'route' },
  { id: 'build', label: 'Build', name: 'build' },
  { id: 'ship', label: 'Ship', name: 'ship' }
];

// The section that closes the home page.
export const QUICKSTART_ID = 'start';

export const PRIMARY_LINKS: readonly NavigationLink[] = [
  { to: '/', label: 'Story', end: true },
  { to: '/demo/architecture', label: 'Architecture' },
  { to: '/demo/cli', label: 'CLI' },
  { to: '/demo/streaming', label: 'Streaming' },
  { to: '/demo/actions', label: 'Actions' },
  { to: '/demo/routes/1', label: 'Routes' }
];

export const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    title: 'Explore',
    links: [
      { to: '/demo/architecture', label: 'Architecture' },
      { to: '/demo/cli', label: 'CLI workflow' },
      { to: '/demo/streaming', label: 'Streaming runtime' }
    ]
  },
  {
    title: 'Workbench',
    links: [
      { to: '/demo/actions', label: 'Optimistic state' },
      { to: '/demo/routes/1', label: 'Typed routes' },
      { to: '/api/health', label: 'Health endpoint', reloadDocument: true }
    ]
  }
];

export const DESTINATIONS: readonly Destination[] = [
  {
    path: '/demo/architecture',
    name: 'Architecture',
    description: 'See the connections',
    symbol: '⌘'
  },
  {
    path: '/demo/cli',
    name: 'CLI workflow',
    description: 'Start something new',
    symbol: '>_'
  },
  {
    path: '/demo/streaming',
    name: 'Runtime',
    description: 'Follow the stream',
    symbol: '↗'
  },
  {
    path: '/demo/actions',
    name: 'Optimistic state',
    description: 'Make an interaction',
    symbol: '+1'
  },
  {
    path: '/demo/routes/1',
    name: 'Typed routes',
    description: 'Explore route data',
    symbol: '{}'
  }
];
