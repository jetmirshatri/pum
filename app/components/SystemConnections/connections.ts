export type ConnectionNode = {
  label: string;
  tag: string;
  file: string;
  title: string;
  body: string;
  trace: string[];
};

export type ConnectionScene = {
  id: string;
  label: string;
  summary: string;
  caption: string;
  nodes: ConnectionNode[];
  edges: [number, number][];
};

export const CONNECTIONS: ConnectionScene[] = [
  {
    id: 'cli',
    label: 'CLI',
    summary: 'The tools behind the first command.',
    caption:
      '--yes skips prompts. GitHub preflight runs only with --github. Optional setup follows scaffolding.',
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5]
    ],
    nodes: [
      {
        label: 'Command',
        tag: 'Commander',
        file: 'source/cli.js + source/commands/create/project.js',
        title: 'Turn arguments into intent.',
        body: 'Commander defines create and update with their flags. The create action validates the directory against path and npm naming rules before resolving the rest of the configuration.',
        trace: [
          'bin/vitex.js → cli(process.argv)',
          'Commander → create <project-directory>',
          'validateDirName → project options'
        ]
      },
      {
        label: 'Choices',
        tag: 'Inquirer',
        file: 'source/commands/create/inquirer-prompt.js',
        title: 'Fill in the missing decisions.',
        body: 'Inquirer asks for project metadata, template, Git, and installation choices that were not supplied. --yes uses defaults without implying installation or Git. --github separately implies Git.',
        trace: [
          'promptForMissingOptions(options)',
          '--yes → defaults',
          '--git / --github / --install → explicit setup'
        ]
      },
      {
        label: 'Preflight',
        tag: 'Git + gh',
        file: 'source/commands/create/main.js',
        title: 'Check GitHub before touching the target.',
        body: 'With --github, preflight checks the local target, Git availability, the authenticated gh user, and whether the remote repository already exists. These checks run before project files are created.',
        trace: [
          'preflightGitHubRepository(projectName)',
          'git --version + gh api user',
          'Repository lookup → require HTTP 404'
        ]
      },
      {
        label: 'Scaffold',
        tag: 'fs-extra',
        file: 'source/utils/files.js + source/commands/create/main.js',
        title: 'Copy the template. Write your metadata.',
        body: 'The CLI copies the managed template files, excluding generated build and dependency directories. It writes package.json, README, LICENSE, ignored environment files, and .gitignore for the new project.',
        trace: [
          'getTemplateFiles → copyTemplateFiles',
          'createPackageJson + createREADME + createLicense',
          'createDotfiles → local environment files'
        ]
      },
      {
        label: 'Provenance',
        tag: 'SHA-256',
        file: 'source/utils/template-manifest.js',
        title: 'Remember the template baseline.',
        body: 'The manifest records SHA-256 hashes from the bundled template and a snapshot of managed package fields. Updates use that baseline to distinguish template changes from local edits and preserve custom package entries.',
        trace: [
          'createTemplateManifest({ template, templateDir })',
          '.vitex-manifest.json → hashes + package baseline',
          'vitex update → compare + merge + transaction'
        ]
      },
      {
        label: 'Optional setup',
        tag: 'Execa',
        file: 'source/commands/create/main.js',
        title: 'Run the steps you selected.',
        body: 'Execa runs npm install, then Git initialization and the first commit when selected. --github creates a private repository, sets origin, and pushes afterward. Failures in optional setup preserve the project.',
        trace: [
          '--install → npm install',
          '--git or --github → git init / add / commit',
          '--github → gh repo create --private --push'
        ]
      }
    ]
  },
  {
    id: 'application',
    label: 'Application',
    summary: 'The tree behind every screen.',
    caption:
      'Three entry points connect Server Components, HTML rendering, and browser hydration.',
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5]
    ],
    nodes: [
      {
        label: 'StrictMode',
        tag: 'React',
        file: 'app/entry.ssr.tsx + app/entry.client.tsx',
        title: 'The same outer wrapper.',
        body: 'Both entries wrap the application in StrictMode. The server renders a document; the browser hydrates that document inside startTransition.',
        trace: [
          'Server: renderToReadableStream',
          'Browser: startTransition → hydrateRoot',
          'Both: StrictMode → NonceContext → Router'
        ]
      },
      {
        label: 'Provider',
        tag: 'Redux Toolkit',
        file: 'app/redux/index.ts + app/root.client.tsx',
        title: 'One store per server request.',
        body: 'configureAppStore combines mode and counter. The client layout creates a fresh store during SSR, and the browser creates its own from the same server layout theme. Typed hooks give components access.',
        trace: [
          'combineReducers({ mode, counter })',
          'configureStore({ reducer, preloadedState })',
          'useAppSelector / useAppDispatch / useAppStore'
        ]
      },
      {
        label: 'Router',
        tag: 'Server → browser',
        file: 'app/entry.rsc.tsx + app/entry.ssr.tsx + app/entry.client.tsx',
        title: 'A handoff between two routers.',
        body: 'RSCStaticRouter renders the RSC payload into HTML. RSCHydratedRouter resumes routing in the browser and requests RSC payloads during navigation. App-wide mode and counter state belong to Redux.',
        trace: [
          'matchRSCServerRequest → RSCStaticRouter',
          'HTML + RSC payload',
          'RSCHydratedRouter'
        ]
      },
      {
        label: 'Layout',
        tag: 'The document',
        file: 'app/root.tsx + app/root.client.tsx',
        title: 'The shell stays in one place.',
        body: 'The server root imports global CSS; the client layout owns the document, metadata, theme initialization, skip link, header, and footer. ScrollRestoration and the SSR entry’s bootstrap script carry the request nonce.',
        trace: [
          'Meta + Links + initScript',
          'SiteHeader → main → SiteFooter',
          'ScrollRestoration + nonce-protected bootstrap'
        ]
      },
      {
        label: 'Outlet',
        tag: 'Typed routes',
        file: 'app/routes.ts + app/root.tsx',
        title: 'The URL chooses the content.',
        body: 'An explicit route list maps each URL to a module. App renders Outlet inside Layout. Route modules supply loaders, actions, metadata, and error boundaries; api/health and theme/toggle are resource endpoints.',
        trace: [
          "{ path: 'demo/routes/:id', lazy: () => import(…) }",
          'unstable_RSCRouteConfig → explicit route modules',
          'loader / action → route component'
        ]
      },
      {
        label: 'Components',
        tag: 'Shared UI',
        file: 'app/components/ + app/hooks/',
        title: 'Small pieces, shared behavior.',
        body: 'SiteHeader and SiteFooter surround routed content. ThemeSwitcher connects to the mode store and a resource action. Image handles loading and responsive sources. The home route renders on the server and reads its visit count after hydration.',
        trace: [
          'Layout → SiteHeader + SiteFooter',
          'Route → reusable components + CSS Modules',
          'Motion → shared presets + reduced motion'
        ]
      }
    ]
  },
  {
    id: 'appearance',
    label: 'Appearance',
    summary: 'A theme travels through the whole app.',
    caption:
      'Use the theme switch in the navigation to see these connections at work.',
    edges: [
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5]
    ],
    nodes: [
      {
        label: 'ThemeSwitcher',
        tag: 'Interaction',
        file: 'app/components/ThemeSwitcher/ThemeSwitcher.tsx',
        title: 'One switch, two updates.',
        body: 'The switch immediately toggles Redux through useDarkMode and submits a fetcher POST to theme/toggle. The visual change and the persisted server preference have separate paths.',
        trace: [
          'useDarkMode().toggle()',
          "fetcher.submit({ theme }, { method: 'post' })",
          '/theme/toggle → Set-Cookie'
        ]
      },
      {
        label: 'Preferences',
        tag: 'Cookie + storage',
        file: 'app/sessions.server.ts + app/hooks/DarkMode/',
        title: 'Remembered on both sides.',
        body: 'A signed, HttpOnly theme cookie lets the next server render start with the chosen theme. Local storage preserves the browser preference. Without an explicit theme, the initialization script can use the operating system preference.',
        trace: [
          'Theme action → signed session cookie',
          'Server layout → session.get("theme")',
          'Local storage / matchMedia → initScript'
        ]
      },
      {
        label: 'Mode slice',
        tag: 'Redux',
        file: 'app/redux/modules/Mode.ts',
        title: 'The explicit choice wins.',
        body: 'The mode slice holds dark and hasExplicit. useDarkMode responds to storage events across tabs and to operating system changes when no explicit choice is present.',
        trace: [
          'Root theme → initial mode state',
          'toggleMode / setExplicitMode / setMode',
          'useAppSelector → useDarkMode'
        ]
      },
      {
        label: 'HTML class',
        tag: 'DOM',
        file: 'app/hooks/DarkMode/useDarkMode.ts',
        title: 'The theme reaches the document.',
        body: 'The server layout supplies the server’s theme class. The initialization script runs before hydration, and useDarkMode keeps html.light or html.dark aligned with Redux afterward.',
        trace: [
          'SSR: <html className={theme}>',
          'Before hydration: initScript',
          'After hydration: classList.toggle'
        ]
      },
      {
        label: 'Global tokens',
        tag: 'CSS variables',
        file: 'app/styles/global.css + variables.css + day.css + night.css',
        title: 'One vocabulary for every surface.',
        body: 'root.tsx imports global.css. Primitive variables feed semantic day and night tokens for surfaces, text, borders, focus, and motion. Components consume those names, so a theme change propagates through the app.',
        trace: [
          'variables.css → primitive tokens',
          'day.css / night.css → semantic tokens',
          'var(--surface-raised) / var(--text-primary)'
        ]
      },
      {
        label: 'CSS Modules',
        tag: 'Components',
        file: 'vite.config.ts + .postcssrc.json + app/styles/mediaqueries.css',
        title: 'Local styles, shared foundations.',
        body: 'CSS Modules scope component rules. Vite exports dashed selectors in camel case. PostCSS shares named breakpoints, transforms nesting and custom media, and leaves runtime CSS variables intact.',
        trace: [
          '*.module.css → styles.className',
          "localsConvention: 'dashes'",
          'PostCSS → custom media + nesting'
        ]
      }
    ]
  },
  {
    id: 'toolchain',
    label: 'Toolchain',
    summary: 'From authored source to checked output.',
    caption:
      'npm run lint runs Oxlint, Oxfmt, Stylelint, and TypeScript. npm run build is a separate script.',
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5]
    ],
    nodes: [
      {
        label: 'Route contracts',
        tag: 'TypeScript',
        file: 'package.json + app/routes.ts',
        title: 'Types follow the route configuration.',
        body: 'Data Mode uses explicit route objects and public loader and action argument types. Components infer data from the route functions; loaders validate URL parameters at runtime.',
        trace: [
          'unstable_RSCRouteConfig',
          'LoaderFunctionArgs / ActionFunctionArgs',
          'typeof loader / typeof action'
        ]
      },
      {
        label: 'Oxlint + Oxfmt',
        tag: 'Code quality',
        file: '.oxlintrc.json + .oxfmtrc.json',
        title: 'Check the code as a whole.',
        body: 'oxlint begins the lint pipeline with correctness, React Compiler, and accessibility rules; oxfmt then checks formatting and import order. lint:fix opts into writing fixes.',
        trace: [
          'npm run lint → oxlint && oxfmt --check',
          '.oxlintrc.json + .oxfmtrc.json → project rules',
          'npm run lint:fix → oxlint --fix && oxfmt'
        ]
      },
      {
        label: 'Stylelint',
        tag: 'Style quality',
        file: '.stylelintrc + package.json',
        title: 'Styles get their own checks.',
        body: 'Stylelint checks global styles and CSS Modules using the standard and clean-order configurations. It runs after Oxlint and Oxfmt and before the TypeScript check.',
        trace: [
          'stylelint "app/**/*.module.css" "app/**/*.css"',
          'Standard rules + declaration order',
          'lint:fix → stylelint --fix'
        ]
      },
      {
        label: 'TypeScript',
        tag: 'Type safety',
        file: 'tsconfig.json + package.json',
        title: 'Check the application contracts.',
        body: 'tsrs, a Rust port of the TypeScript 7 compiler, completes the lint pipeline. Path aliases connect imports such as @/store to app/redux, while inferred loader and action types connect server data to components.',
        trace: [
          'oxlint → oxfmt → stylelint → tsrs',
          '@/store/* → app/redux/*',
          'Type checking does not build the app'
        ]
      },
      {
        label: 'Vite + Compiler',
        tag: 'Build',
        file: 'vite.config.ts + .postcssrc.json',
        title: 'The source becomes three environments.',
        body: 'Vite’s React and RSC plugins build client, RSC, and SSR output. The React plugin runs React Compiler natively through oxc-transform-react on client application files; RSC and SSR output renders once per request and is not memoized.',
        trace: [
          'npm run build → vite build',
          'React plugin + RSC plugin + React Compiler',
          'Client + RSC + SSR environments'
        ]
      },
      {
        label: 'Build artifacts',
        tag: 'Ready to serve',
        file: 'vite.config.ts + package.json',
        title: 'Browser assets and a server entry.',
        body: 'The RSC entry is imported through #vitex and loads the SSR bundle to produce HTML. After all three builds finish, a script generates Brotli and gzip variants for browser assets above its 10,240-byte threshold.',
        trace: [
          'build/client/ → browser assets',
          'build/rsc/index.js → #vitex → build/ssr/',
          'compression → .br + .gz'
        ]
      }
    ]
  },
  {
    id: 'delivery',
    label: 'Delivery',
    summary: 'The build has two ways to reach the browser.',
    caption:
      'This is the production path: one Express process behind a reverse proxy, started with npm start.',
    edges: [
      [0, 1],
      [0, 2],
      [1, 5],
      [2, 3],
      [3, 4],
      [4, 5]
    ],
    nodes: [
      {
        label: 'Start command',
        tag: 'npm start',
        file: 'package.json',
        title: 'Build, then run one process.',
        body: 'npm run build produces the client, RSC, and SSR bundles. npm start loads .prod.env, selects production mode, and listens on loopback (127.0.0.1:3000 by default) so a reverse proxy can front it. Production sessions require SESSION_SECRET.',
        trace: [
          'npm run lint → npm run build',
          'node --env-file-if-exists=.prod.env server.js --mode=production',
          'HOST and PORT override the defaults'
        ]
      },
      {
        label: 'Static assets',
        tag: 'Precompressed',
        file: 'server.js',
        title: 'Assets take the direct path.',
        body: 'express-static-gzip serves build/client, preferring the Brotli and gzip variants the build generated. Hashed asset URLs under /assets receive immutable cache headers; everything else falls through to the request handler.',
        trace: [
          'build/client → express-static-gzip',
          'Accept-Encoding → .br or .gz',
          '/assets/* → max-age=1y, immutable'
        ]
      },
      {
        label: 'Express',
        tag: 'Process',
        file: 'server.js',
        title: 'Dynamic requests reach the app.',
        body: 'A process manager keeps server.js running behind the reverse proxy, which terminates TLS. Express trusts that proxy for the protocol, exposes /healthz and /readyz for liveness and readiness checks, and routes unmatched paths to the request handler.',
        trace: [
          'reverse proxy → 127.0.0.1:PORT',
          '/healthz and /readyz → { status: "ok" }',
          'Static miss → request handler'
        ]
      },
      {
        label: 'Request handler',
        tag: 'React Router',
        file: 'server.js',
        title: 'The same server contract.',
        body: 'Production imports the RSC entry through #vitex. Development loads that entry through Vite’s RSC environment runner. createRequestListener adapts Express requests and Fetch responses in both modes.',
        trace: [
          'Production: import("#vitex")',
          'Development: RSC environment runner',
          'createRequestListener → handleRequest(request, nonce)'
        ]
      },
      {
        label: 'Streamed response',
        tag: 'Server render',
        file: 'app/entry.ssr.tsx',
        title: 'HTML takes the rendering path.',
        body: 'The SSR entry decodes the RSC stream and renders HTML with React’s readable stream. The response carries the document and RSC payload; HTML uses no-cache while resource routes retain their own policies.',
        trace: [
          'RSC payload → RSCStaticRouter',
          'renderToReadableStream → streamed HTML',
          'Response → text/html; Cache-Control: no-cache'
        ]
      },
      {
        label: 'Browser',
        tag: 'Hydration',
        file: 'app/entry.client.tsx',
        title: 'Both paths meet on the screen.',
        body: 'The browser decodes the embedded RSC payload and hydrates RSCHydratedRouter. Its client layout creates Redux from the root theme. Navigation, resource actions, and fetchers continue from here.',
        trace: [
          'HTML + CSS + JavaScript',
          'getRSCStream → RSCHydratedRouter',
          'hydrateRoot(document, …)'
        ]
      }
    ]
  }
];
