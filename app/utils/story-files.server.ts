import 'server-only';

import type { EditorFile, Owner } from '@/components/Editor/Editor';

// The files the editors of the home page open. They are this project's own
// sources, read at build time on the server: an excerpt of each goes to the
// browser as text, and this module never does.

const sources = import.meta.glob<string>(
  [
    '/server.js',
    '/vite.config.ts',
    '/package.json',
    '/.vitex-manifest.json',
    '/app/entry.rsc.tsx',
    '/app/entry.ssr.tsx',
    '/app/entry.client.tsx',
    '/app/routes.ts',
    '/app/config/site.ts',
    '/app/routes/_index.tsx',
    '/app/db/schema.ts'
  ],
  { query: '?raw', import: 'default', eager: true }
);

// A part of a file: from the first line that matches `from` through the next
// line that matches `to`, or for a number of lines.
type Region = { from: RegExp; to?: RegExp; lines?: number };

const cut = (rows: readonly string[], { from, to, lines = 1 }: Region) => {
  const start = rows.findIndex((row) => from.test(row));
  if (start < 0) return [];
  const end = to
    ? rows.findIndex((row, index) => index > start && to.test(row))
    : start + lines - 1;
  const part = rows.slice(start, end < 0 ? start + 24 : end + 1);
  const indent = Math.min(
    ...part.filter((row) => row.trim()).map((row) => row.search(/\S/))
  );
  return part.map((row) => row.slice(indent));
};

const mark = (lines: readonly string[], marks: readonly RegExp[]) =>
  lines.flatMap((line, index) =>
    marks.some((pattern) => pattern.test(line)) ? [index + 1] : []
  );

/** An excerpt of a source file: its regions, with the gaps between them. */
const excerpt = (
  path: string,
  owner: Owner,
  regions: readonly Region[],
  marks: readonly RegExp[]
): EditorFile => {
  const text = sources[`/${path}`];
  if (text === undefined) {
    return {
      path,
      owner,
      marks: [],
      code: `// ${path} is not in this project.`
    };
  }
  const rows = text.split('\n');
  const parts = regions
    .map((region) => cut(rows, region))
    .filter((part) => part.length > 0);
  const gap = path.endsWith('.json') ? '…' : '// …';
  const lines: string[] = [];
  for (const part of parts) {
    if (lines.length > 0) lines.push(gap);
    lines.push(...part);
  }
  if (lines.length === 0) lines.push(...rows.slice(0, 24));
  return { path, owner, code: lines.join('\n'), marks: mark(lines, marks) };
};

type Manifest = {
  schemaVersion: number;
  template: string;
  features: string[];
  generator: { name: string; version: string };
  files: Record<string, string>;
};

const readManifest = (): Manifest | null => {
  try {
    return JSON.parse(sources['/.vitex-manifest.json'] ?? '') as Manifest;
  } catch {
    return null;
  }
};

/** The manifest, shortened to a few of its hashes. */
const manifestFile = (manifest: Manifest | null): EditorFile => {
  const path = '.vitex-manifest.json';
  if (!manifest) {
    return {
      path,
      owner: 'rec',
      marks: [],
      code: '// This project has no .vitex-manifest.json.'
    };
  }
  const names = Object.keys(manifest.files);
  const shown = [
    '.github/workflows/ci.yml',
    '.nvmrc',
    'server.js',
    'vite.config.ts'
  ].filter((name) => name in manifest.files);
  const lines = [
    '{',
    `  "schemaVersion": ${manifest.schemaVersion},`,
    `  "template": ${JSON.stringify(manifest.template)},`,
    `  "features": ${JSON.stringify(manifest.features).replaceAll(',', ', ')},`,
    `  "generator": { "name": ${JSON.stringify(manifest.generator.name)}, "version": ${JSON.stringify(manifest.generator.version)} },`,
    '  "files": {',
    ...shown.map(
      (name) =>
        `    ${JSON.stringify(name)}: "${manifest.files[name]?.slice(0, 19)}…",`
    ),
    `    … and ${names.length - shown.length} more`,
    '  }',
    '}'
  ];
  return {
    path,
    owner: 'rec',
    code: lines.join('\n'),
    marks: mark(lines, [/"features"/, /"server\.js"/, /"vite\.config\.ts"/])
  };
};

// What the two overlays declare. feature.json stays in the CLI package, so a
// project has no copy of it to read.
const POSTGRES_FEATURE = `{
  "name": "postgres",
  "template": "vitex",
  "package": {
    "dependencies": { "drizzle-orm": "^0.45.3", "pg": "^8.23.1" },
    "devDependencies": { "@types/pg": "^8.23.1", "drizzle-kit": "^0.31.11" },
    "scripts": {
      "db:generate": "drizzle-kit generate",
      "db:check": "drizzle-kit check",
      "db:migrate": "node scripts/db/migrate.mjs",
      "db:verify-expand-only": "node scripts/db/verify-expand-only.mjs"
    }
  },
  "environment": ["# PostgreSQL. Required with the postgres feature …", "# DATABASE_URL="],
  "readme": "## Database\\n\\nPostgreSQL through Drizzle. …"
}`;

const DEMO_FEATURE = `{
  "name": "demo",
  "template": "vitex",
  "description": "Demo pages that show the template at work: …",
  "readme": "## Demos\\n\\nThis project was created with \`--demo\`. …"
}`;

const SCHEMA = `import { pgSchema } from 'drizzle-orm/pg-core';

// Every table belongs to the app schema. Declare tables here with
// app.table('name', { ... }) and run npm run db:generate -- --name <change>
// to write the migration; keep timestamps as timestamptz.
export const app = pgSchema('app');`;

export type StoryFiles = {
  /** Every file the explorer of the ownership chapter can open. */
  project: EditorFile[];
  /** The files a request passes, in order. */
  route: EditorFile[];
  vite: EditorFile;
  /** What the overlays declare. */
  features: EditorFile[];
  /** The start of the hash the manifest holds for server.js. */
  serverHash: string;
};

const build = (): StoryFiles => {
  const manifest = readManifest();
  // A file with a hash in the manifest is template-managed; the rest is yours.
  const owner = (path: string): Owner =>
    manifest && path in manifest.files ? 'tpl' : 'you';
  const source = (
    path: string,
    regions: readonly Region[],
    marks: readonly RegExp[]
  ) => excerpt(path, owner(path), regions, marks);

  const server = source(
    'server.js',
    [
      { from: /^const attachNonce/, to: /^};/ },
      { from: /^app\.use\(attachNonce\)/, lines: 2 },
      { from: /^app\.use\(async \(request, response, next\)/, to: /^}\);/ }
    ],
    [/cspNonce = /, /handleRequest\(fetchRequest/]
  );
  const vite = source(
    'vite.config.ts',
    [
      { from: /^\s*plugins: \[/, to: /^\s{2}\],/ },
      { from: /^\s*environments: \{/, to: /^\s{2}\}/ }
    ],
    [/compiler: true/, /outDir:/]
  );
  const rsc = source(
    'app/entry.rsc.tsx',
    [{ from: /^export default async function handleRequest/, to: /^}/ }],
    [/matchRSCServerRequest\(/, /text\/x-component/, /return generateHTML/]
  );
  const ssr = source(
    'app/entry.ssr.tsx',
    [{ from: /routeRSCServerRequest\(\{/, to: /^\s{2}\}\);/ }],
    [/routeRSCServerRequest\(/, /renderToReadableStream\(/, /isbot\(/]
  );
  const client = source(
    'app/entry.client.tsx',
    [{ from: /^createFromReadableStream<RSCPayload>/, to: /^}\);/ }],
    [/hydrateRoot\(/]
  );
  const routes = source(
    'app/routes.ts',
    [{ from: /^export function routes/, to: /^}/ }],
    [/id: 'home'/]
  );
  const home = source(
    'app/routes/_index.tsx',
    [{ from: /^export default function/, lines: 16 }],
    [/^export default function/]
  );
  const site = source(
    'app/config/site.ts',
    [{ from: /^export const site/, to: /^};/ }],
    [/title:/, /lang:/]
  );
  const schema: EditorFile = sources['/app/db/schema.ts']
    ? excerpt(
        'app/db/schema.ts',
        'you',
        [{ from: /^import/, lines: 12 }],
        [/pgSchema\('app'\)/]
      )
    : { path: 'app/db/schema.ts', owner: 'you', code: SCHEMA, marks: [6] };
  const packageJson = excerpt(
    'package.json',
    'both',
    [
      { from: /"imports"/, to: /^\s{2}\},/ },
      { from: /"scripts"/, to: /^\s{2}\},?$/ }
    ],
    [/#vitex/, /"dev"/, /"build"/, /"start"/]
  );

  return {
    project: [
      manifestFile(manifest),
      server,
      vite,
      rsc,
      ssr,
      client,
      routes,
      home,
      site,
      schema,
      packageJson
    ],
    route: [routes, server, rsc, ssr, home, client],
    vite,
    serverHash: `${manifest?.files['server.js']?.slice(7, 19) ?? 'f0455b43cea0'}…`,
    features: [
      {
        path: 'vitex-postgres/feature.json',
        owner: 'tpl',
        code: POSTGRES_FEATURE,
        marks: [5, 6, 7, 14]
      },
      {
        path: 'vitex-demo/feature.json',
        owner: 'tpl',
        code: DEMO_FEATURE,
        marks: [2, 3]
      }
    ]
  };
};

const files = build();

/** The excerpts, built once when the server starts. */
export const storyFiles = (): StoryFiles => files;
