'use client';

import { clsx } from 'clsx';
import {
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useSpring
} from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useChapter } from '@/components/Chapter/Chapter';
import { Choice, Flags, PanelButton } from '@/components/Controls/Controls';
import { Editor } from '@/components/Editor/Editor';
import {
  Ink,
  ResultBox,
  Terminal,
  TerminalButton
} from '@/components/Terminal/Terminal';
import { useIslandXRay } from '@/components/XRay/useIslandXRay';
import { useReplayKey } from '@/hooks/useReplayKey';
import { useAppSelector } from '@/store/index';
import { createCommand, selectFlags } from '@/store/modules/Story';
import { copyToClipboard } from '@/utils/clipboard.client';

import * as styles from './_index.module.css';

import type { MotionStyle, MotionValue } from 'motion/react';
import type { ReactNode } from 'react';
import type { MetaFunction } from 'react-router';

import type { EditorFile, TreeRow } from '@/components/Editor/Editor';
import type { Line } from '@/components/Terminal/Terminal';
import type { Flags as FlagValues } from '@/store/modules/Story';

// The client islands of the home page. The page itself is the Server
// Component in _index.tsx: it writes the story and draws the figures, and
// hands these panels the files they show.

export const meta: MetaFunction = () => [
  { title: 'Vitex: one command, a whole app, taken apart' },
  {
    name: 'description',
    content:
      'What vitex create writes, who owns it, how it stays current, and how React Router 8 and Vite 8 work in it: a story you scroll through and can run.'
  },
  { property: 'og:title', content: 'Vitex' }
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Moves custom properties, one after another or together, and can be stopped:
 * a panel stops what still runs before it starts something else. Under
 * reduced motion a value is set at once.
 */
const useMover = (reduced: boolean) => {
  const running = useRef<{ stop: () => void }[]>([]);
  return useMemo(
    () => ({
      stop: () => {
        for (const animation of running.current) animation.stop();
        running.current = [];
      },
      to: async (
        value: MotionValue<number>,
        target: number,
        duration: number
      ) => {
        if (reduced) {
          value.set(target);
          return;
        }
        const animation = animate(value, target, { duration, ease: EASE });
        running.current.push(animation);
        await animation;
      }
    }),
    [reduced]
  );
};

/* ── The whole story ─────────────────────────────────────────────────── */

/**
 * The frame of the story. It turns the reader's flags into --fd and --fp, how
 * present the demo and the postgres overlay are in every figure.
 */
export const StoryRoot = ({ children }: { children: ReactNode }) => {
  const flags = useAppSelector(selectFlags);
  const reduced = useReducedMotion() === true;
  const demo = useSpring(flags.demo ? 1 : 0, { stiffness: 190, damping: 26 });
  const postgres = useSpring(flags.postgres ? 1 : 0, {
    stiffness: 190,
    damping: 26
  });
  useEffect(() => {
    if (reduced) {
      demo.jump(Number(flags.demo));
      postgres.jump(Number(flags.postgres));
    } else {
      demo.set(Number(flags.demo));
      postgres.set(Number(flags.postgres));
    }
  }, [demo, postgres, flags.demo, flags.postgres, reduced]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={styles.story}
        style={{ '--fd': demo, '--fp': postgres } as MotionStyle}>
        {children}
      </motion.div>
    </MotionConfig>
  );
};

/** The command of the title, with a button that copies it. */
export const HeroCommand = () => {
  const [copied, setCopied] = useState(false);
  const island = useIslandXRay('copies the command');
  const copy = () => {
    copyToClipboard('vitex create my-app')
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  };
  return (
    <div {...island}>
      <div className={styles.command}>
        <span>
          <i>$</i> vitex create my-app
          <i className={styles.caret} aria-hidden="true" />
        </span>
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

/** Lets the assembled block breathe while its chapter is on screen. */
export const Breathe = () => {
  const chapter = useChapter();
  const reduced = useReducedMotion() === true;
  const marker = useRef<HTMLElement>(null);
  const visible = useInView(marker);
  const breath = chapter.value('--breath');
  const sway = chapter.value('--sway');
  useEffect(() => {
    if (reduced || !visible) return undefined;
    const options = {
      duration: 6,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut'
    } as const;
    const controls = [
      animate(breath, [0, 1], options),
      animate(sway, [-1, 1], options)
    ];
    return () => controls.forEach((control) => control.stop());
  }, [breath, sway, reduced, visible]);
  return <i ref={marker} className={styles.marker} aria-hidden="true" />;
};

/** How many origins the project has with the reader's flags. */
export const Origins = () => {
  const flags = useAppSelector(selectFlags);
  const count = 1 + Number(flags.demo) + Number(flags.postgres);
  return (
    <>
      {count} origin{count > 1 ? 's' : ''} · 1 project
    </>
  );
};

/* ── 01 Create ───────────────────────────────────────────────────────── */

const BANNER = [
  String.raw`         _  _`,
  String.raw` __   __(_)| |_  ___ __  __`,
  String.raw` \ \ / /| || __|/ _ \\ \/ /`,
  String.raw`  \ V / | || |_|  __/ >  <`,
  String.raw`   \_/  |_| \__|\___|/_/\_\ `
];

const task = (text: string): Line => ({
  content: (
    <>
      {'  '}
      <Ink tone="green">✔ {text}</Ink>
    </>
  )
});

const createLines = (flags: FlagValues): Line[] => [
  { command: createCommand(flags) },
  {},
  ...BANNER.map((row): Line => ({
    art: true,
    content: (
      <Ink tone="green" bold>
        {row}
      </Ink>
    )
  })),
  {},
  task('Copy project files'),
  task('Create app/config/site.ts'),
  task('Create package.json'),
  task('Create package-lock.json'),
  task('Create LICENSE'),
  task('Create README.md'),
  task('Create env & .gitignore files'),
  task('Create .vitex-manifest.json'),
  ...(flags.install ? [task('Install all dependencies')] : []),
  ...(flags.git ? [task('Initialize git')] : []),
  task('DONE Project is ready'),
  {
    content: (
      <ResultBox title="Success! Created project my-app">
        {'\n\n  project:  ~/code/my-app\n\n  '}
        <b>Next steps</b>
        {'\n'}
        <Ink tone="cyan">
          {'    cd my-app\n'}
          {flags.install ? '' : '    npm install\n'}
          {'    npm run dev'}
        </Ink>
      </ResultBox>
    )
  }
];

/**
 * The flags, and the run they give. The run prints with the scroll; the run
 * button (or r) replays it over time. Its bricks land in the figure.
 */
export const CreateRun = () => {
  const chapter = useChapter();
  const flags = useAppSelector(selectFlags);
  const reduced = useReducedMotion() === true;
  const lines = useMemo(() => createLines(flags), [flags]);
  const count = chapter.value('--n');
  const run = chapter.value('--run');
  const playing = useRef<{ stop: () => void }>(null);
  const island = useIslandXRay('your flags, kept in the Redux store');

  useEffect(() => {
    count.set(lines.length);
  }, [count, lines.length]);

  const replay = () => {
    playing.current?.stop();
    chapter.setState('run', 'on');
    if (reduced) {
      run.set(1);
      return;
    }
    run.set(0);
    playing.current = animate(run, 1, { duration: 4.4, ease: 'linear' });
  };
  // Back at the top of the chapter, the scroll prints the run again.
  useMotionValueEvent(chapter.progress, 'change', (progress) => {
    if (progress > 0 || chapter.state.run !== 'on') return;
    playing.current?.stop();
    chapter.setState('run', 'off');
  });
  useReplayKey(chapter.id, replay);

  return (
    <div {...island}>
      <Flags label="Flags of vitex create" />
      <Terminal
        label="vitex create, with your flags"
        path="~/code"
        print="scroll"
        lines={lines}
        action={<TerminalButton onClick={replay}>▶ run</TerminalButton>}
      />
    </div>
  );
};

/* ── 02 Compose ──────────────────────────────────────────────────────── */

type LayerName = 'base' | 'demo' | 'postgres';

const PATHS: readonly (readonly [string, readonly LayerName[]])[] = [
  ['server.js', ['base']],
  ['app/routes/_index.tsx', ['base', 'demo']],
  ['app/styles/theme.css', ['base', 'demo']],
  ['app/components/AppShell', ['base', 'demo']],
  ['app/routes/demo.*.tsx', ['demo']],
  ['app/db/schema.ts', ['postgres']],
  ['drizzle/0000_app_schema.sql', ['postgres']],
  ['package.json', ['base', 'postgres']]
];

const LAYERS: readonly LayerName[] = ['base', 'demo', 'postgres'];
const LAYER_NAME = { base: 'vitex', demo: 'demo', postgres: 'postgres' };

const WHY = {
  base: 'Only the base template has this path. It is copied as it is.',
  replaces:
    "Both layers have this path. The overlay is laid over the template, so the overlay's file is the one you get.",
  adds: 'Only the overlay has this path. It is added to the project.',
  merged:
    "package.json is merged, not replaced: feature.json adds drizzle-orm, pg, drizzle-kit and the db:* scripts to the template's fields.",
  absent:
    'This path comes from an overlay you switched off, so it is not in the project.'
};

/** Which layer a path comes from, with the reader's flags. */
export const LayerMatrix = () => {
  const chapter = useChapter();
  const flags = useAppSelector(selectFlags);
  const [picked, setPicked] = useState(1);
  const island = useIslandXRay('picks a path, lights its layer');

  const rows = PATHS.map(([path, layers]) => {
    const active = layers.filter(
      (layer) => layer === 'base' || flags[layer as 'demo' | 'postgres']
    );
    const winner = active.at(-1);
    const kind = !winner
      ? 'absent'
      : path === 'package.json' && winner === 'postgres'
        ? 'merged'
        : winner === 'base'
          ? 'base'
          : layers.includes('base')
            ? 'replaces'
            : 'adds';
    const verdict =
      kind === 'absent'
        ? 'not in the project'
        : kind === 'merged'
          ? 'merged'
          : kind === 'base'
            ? 'vitex'
            : `${LAYER_NAME[winner ?? 'base']} ${kind}`;
    return { path, layers, active, winner, kind, verdict } as const;
  });
  const pick = rows[picked] ?? rows[0];
  const lit = pick?.winner ?? 'none';

  useEffect(() => {
    chapter.setState('pick', lit);
  }, [chapter, lit]);

  return (
    <div {...island}>
      <Flags label="Overlays" only={['demo', 'postgres']} />
      <div className={styles.matrix}>
        <div
          className={clsx(styles.matrixRow, styles.matrixHead)}
          aria-hidden="true">
          <span>path</span>
          <span>vitex</span>
          <span>demo</span>
          <span>pg</span>
          <span>my-app gets</span>
        </div>
        {rows.map((row, index) => (
          <button
            key={row.path}
            type="button"
            className={clsx(
              styles.matrixRow,
              row.kind === 'absent' && styles.absent
            )}
            aria-pressed={index === picked}
            aria-label={`${row.path}: ${row.verdict}`}
            onClick={() => setPicked(index)}>
            <code>{row.path}</code>
            {LAYERS.map((layer) => (
              <i
                key={layer}
                className={clsx(
                  styles.cell,
                  styles[layer],
                  !row.active.includes(layer) && styles.cellOff,
                  row.active.includes(layer) &&
                    layer !== row.winner &&
                    row.kind !== 'merged' &&
                    styles.cellLost
                )}
              />
            ))}
            <em className={styles[row.winner ?? 'base']}>{row.verdict}</em>
          </button>
        ))}
        <p className={styles.note} aria-live="polite">
          {pick ? WHY[pick.kind] : ''}
        </p>
      </div>
    </div>
  );
};

/** What the two overlays declare, as files to open. */
export const FeatureFiles = ({ files }: { files: readonly EditorFile[] }) => {
  const [open, setOpen] = useState(files[0]?.path ?? '');
  const island = useIslandXRay('opens a file at once, as an editor does');
  return (
    <div {...island}>
      <Editor
        label="What an overlay declares"
        files={files}
        open={open}
        onOpen={setOpen}
        rows={15}
      />
    </div>
  );
};

/* ── 03 Own ──────────────────────────────────────────────────────────── */

const TREE: readonly (TreeRow & { needs?: 'postgres' })[] = [
  { label: 'app/', owner: 'you' },
  { label: 'entry.rsc.tsx', path: 'app/entry.rsc.tsx', owner: 'you', depth: 1 },
  { label: 'entry.ssr.tsx', path: 'app/entry.ssr.tsx', owner: 'you', depth: 1 },
  {
    label: 'entry.client.tsx',
    path: 'app/entry.client.tsx',
    owner: 'you',
    depth: 1
  },
  { label: 'routes.ts', path: 'app/routes.ts', owner: 'you', depth: 1 },
  {
    label: 'routes/_index.tsx',
    path: 'app/routes/_index.tsx',
    owner: 'you',
    depth: 1
  },
  {
    label: 'config/site.ts',
    path: 'app/config/site.ts',
    owner: 'you',
    depth: 1
  },
  {
    label: 'db/schema.ts',
    path: 'app/db/schema.ts',
    owner: 'you',
    depth: 1,
    needs: 'postgres'
  },
  { label: 'drizzle/', owner: 'you', needs: 'postgres' },
  { label: 'public/', owner: 'you' },
  { label: 'server.js', path: 'server.js', owner: 'tpl' },
  { label: 'vite.config.ts', path: 'vite.config.ts', owner: 'tpl' },
  { label: 'scripts/', owner: 'tpl' },
  { label: '.github/ · .vscode/', owner: 'tpl' },
  { label: 'tsconfig.json +6', owner: 'tpl' },
  { label: 'package.json', path: 'package.json', owner: 'both' },
  { label: '.vitex-manifest.json', path: '.vitex-manifest.json', owner: 'rec' }
];

const MANIFEST = '.vitex-manifest.json';

/** The project as an explorer: open a file, see who owns it. */
export const Explorer = ({ files }: { files: readonly EditorFile[] }) => {
  const chapter = useChapter();
  const flags = useAppSelector(selectFlags);
  const [chosen, setChosen] = useState(MANIFEST);
  const island = useIslandXRay('opens a file, lights its tier');
  const tree = TREE.filter((row) => !row.needs || flags[row.needs]);
  // A file of an overlay that is switched off cannot stay open.
  const open = tree.some((row) => row.path === chosen) ? chosen : MANIFEST;
  const tier = files.find((file) => file.path === open)?.owner ?? 'rec';

  useEffect(() => {
    chapter.setState('tier', tier);
  }, [chapter, tier]);

  return (
    <div {...island}>
      <Editor
        label="The files of my-app"
        files={files}
        open={open}
        onOpen={setChosen}
        tree={tree}
        ownership
        rows={16}
      />
      <p className={styles.legend}>
        <span className={styles.yours}>yours</span>
        <span className={styles.managed}>template-managed</span>
        <span className={styles.base}>shared</span>
      </p>
    </div>
  );
};

/* ── 04 Update ───────────────────────────────────────────────────────── */

type UpdateMode = 'clean' | 'conflict' | 'force';

const DETECTED: Line = {
  content: (
    <>
      {' 🔍 '}
      <Ink tone="cyan">Detected vitex project</Ink> (template:{' '}
      <Ink tone="green">vitex</Ink>)
    </>
  ),
  wait: 260
};

const plan = (
  tone: 'yellow' | 'blue' | 'green' | 'red',
  text: string
): Line => ({
  content: <Ink tone={tone}>{`  ${text}`}</Ink>,
  wait: 110
});

const UPDATE: Record<UpdateMode, readonly Line[]> = {
  clean: [
    { command: 'vitex update --dry-run' },
    {},
    DETECTED,
    {},
    plan('yellow', '~ server.js'),
    plan('blue', '+ scripts/compress-assets.mjs'),
    plan('green', '✔ 24 files unchanged'),
    {},
    plan('green', '✔ package.json unchanged'),
    plan('blue', '+ refresh .vitex-manifest.json'),
    {
      content: (
        <ResultBox title="Dry run complete; no files changed.">
          {'\n\n  '}
          <b>Next steps</b>
          {'\n'}
          <Ink tone="cyan">{'    vitex update'}</Ink>
        </ResultBox>
      )
    }
  ],
  conflict: [
    { command: 'vitex update' },
    {},
    DETECTED,
    {},
    plan('blue', '+ scripts/compress-assets.mjs'),
    plan('green', '✔ 24 files unchanged'),
    plan('red', '✖ server.js — locally modified'),
    {},
    plan('green', '✔ package.json unchanged'),
    {
      content: (
        <Ink tone="red">
          Update blocked by 1 local conflict(s). No files were changed. Review
          the plan and rerun with --force only if those changes may be
          overwritten.
        </Ink>
      ),
      wait: 320
    }
  ],
  force: [
    { command: 'vitex update --force' },
    {},
    DETECTED,
    {},
    plan('yellow', '~ server.js (forced)'),
    plan('blue', '+ scripts/compress-assets.mjs'),
    plan('green', '✔ 24 files unchanged'),
    {},
    plan('green', '✔ package.json unchanged'),
    plan('blue', '+ refresh .vitex-manifest.json'),
    {
      content: (
        <>
          <Ink tone="green">?</Ink> <b>Apply 3 planned file change(s)?</b>{' '}
          <Ink tone="cyan">Yes</Ink>
        </>
      ),
      wait: 380
    },
    {
      content: (
        <Ink tone="muted">
          {'  backup: ~/code/my-app/server.js.bak-2026-11-10T20-41-07-512Z'}
        </Ink>
      ),
      wait: 380
    },
    {
      content: (
        <ResultBox title="Update complete!">
          {'\n\n  '}
          <b>Next steps</b>
          {'\n'}
          <Ink tone="cyan">{'    npm install\n    npm run dev'}</Ink>
        </ResultBox>
      )
    }
  ]
};

const COMPARE: Record<
  UpdateMode,
  { disk: string; verdict: string; tone: string | undefined }
> = {
  clean: { disk: '= the manifest', verdict: '~ update', tone: styles.updated },
  conflict: {
    disk: '≠ you edited it',
    verdict: '✖ blocked',
    tone: styles.blocked
  },
  force: {
    disk: '≠ you edited it',
    verdict: '~ forced · .bak kept',
    tone: styles.updated
  }
};

/**
 * The three ways an update can go. The terminal prints the CLI's output and
 * the figure plays what happens to server.js.
 */
export const UpdateScenarios = ({ hash }: { hash: string }) => {
  const chapter = useChapter();
  const reduced = useReducedMotion() === true;
  const [mode, setMode] = useState<UpdateMode>('clean');
  const [run, setRun] = useState(0);
  const sequence = useRef(0);
  const mover = useMover(reduced);
  const panel = useRef<HTMLDivElement>(null);
  const seen = useInView(panel, { once: true, amount: 0.4 });
  const island = useIslandXRay('plays a scenario in the figure');

  const out = chapter.value('--out');
  const swapped = chapter.value('--sw');
  const added = chapter.value('--add');
  const conflict = chapter.value('--cf');
  const backup = chapter.value('--bak');

  const play = async (next: UpdateMode) => {
    sequence.current += 1;
    const mine = sequence.current;
    const stale = () => sequence.current !== mine;
    mover.stop();
    setMode(next);
    setRun((count) => count + 1);
    chapter.setState('mode', next);
    for (const value of [out, swapped, added]) value.set(0);
    if (next === 'conflict') {
      backup.set(0);
      await mover.to(conflict, 1, 0.6);
      return;
    }
    if (next === 'force') {
      conflict.set(1);
      await Promise.all([mover.to(conflict, 0, 0.6), mover.to(backup, 1, 0.6)]);
    } else {
      conflict.set(0);
      backup.set(0);
    }
    // The brick slides out, is swapped, slides back; then the new one lands.
    for (const [value, to, duration] of [
      [out, 1, 0.9],
      [swapped, 1, 0.45],
      [out, 0, 0.9],
      [added, 1, 0.8]
    ] as const) {
      if (stale()) return;
      await mover.to(value, to, duration);
    }
  };

  // The first scenario plays when the panel scrolls into view.
  useEffect(() => {
    if (seen) void play('clean');
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- only on first sight
  }, [seen]);
  useReplayKey(chapter.id, () => void play(mode));

  const compare = COMPARE[mode];
  return (
    <div ref={panel} {...island}>
      <Choice
        label="What happened to your server.js"
        options={[
          { value: 'clean', label: 'untouched' },
          { value: 'conflict', label: 'you edited it' },
          { value: 'force', label: '--force' }
        ]}
        value={mode}
        onChange={(next) => void play(next)}
      />
      <Terminal
        label="vitex update"
        path="~/code/my-app"
        lines={UPDATE[mode]}
        run={run}
        rows={21}
        className={styles.attached}
      />
      <dl className={styles.compare} key={mode} aria-live="polite">
        <div>
          <dt>manifest</dt>
          <dd>{hash}</dd>
        </div>
        <div>
          <dt>on disk</dt>
          <dd>{compare.disk}</dd>
        </div>
        <div>
          <dt>template</dt>
          <dd>has a newer server.js</dd>
        </div>
        <div className={clsx(styles.verdict, compare.tone)}>
          <dt className="sr-only">plan</dt>
          <dd>{compare.verdict}</dd>
        </div>
      </dl>
    </div>
  );
};

/* ── 05 Route ────────────────────────────────────────────────────────── */

type RequestMode = 'doc' | 'nav';
type Hop = {
  /** The plate of the figure the request is at. */
  plate: number;
  name: string;
  role: string;
  file: string;
  note: string;
};

const HOPS: Record<RequestMode, readonly Hop[]> = {
  doc: [
    {
      plate: 1,
      name: 'browser',
      role: 'GET /',
      file: 'app/routes.ts',
      note: 'The browser asks for a document. In app/routes.ts the home route is the one that will match.'
    },
    {
      plate: 2,
      name: 'server.js',
      role: 'Express 5',
      file: 'server.js',
      note: 'server.js adds a CSP nonce and the security headers, then turns the Node request into a Fetch Request.'
    },
    {
      plate: 3,
      name: 'app/entry.rsc.tsx',
      role: 'RSC payload',
      file: 'app/entry.rsc.tsx',
      note: 'matchRSCServerRequest matches the route, runs its loader and renders the Server Components into an RSC payload.'
    },
    {
      plate: 4,
      name: 'app/entry.ssr.tsx',
      role: 'HTML stream',
      file: 'app/entry.ssr.tsx',
      note: 'routeRSCServerRequest and renderToReadableStream decode the payload and stream HTML, the payload embedded in it.'
    },
    {
      plate: 5,
      name: 'browser',
      role: 'paints as it streams',
      file: 'app/routes/_index.tsx',
      note: 'The browser paints while the HTML arrives. What it paints was rendered on the server; Suspense boundaries fill in later.'
    },
    {
      plate: 6,
      name: 'app/entry.client.tsx',
      role: 'hydrate',
      file: 'app/entry.client.tsx',
      note: 'hydrateRoot with RSCHydratedRouter: the client islands become interactive.'
    }
  ],
  nav: [
    {
      plate: 1,
      name: 'browser',
      role: 'a link is clicked',
      file: 'app/routes.ts',
      note: 'No document this time: the router asks for the data of the next route.'
    },
    {
      plate: 2,
      name: 'server.js',
      role: 'same server',
      file: 'server.js',
      note: 'The same Express server and the same headers.'
    },
    {
      plate: 3,
      name: 'app/entry.rsc.tsx',
      role: 'payload only',
      file: 'app/entry.rsc.tsx',
      note: 'The loaders of the new route run and the answer is the RSC payload alone: text/x-component.'
    },
    {
      plate: 5,
      name: 'browser',
      role: 'applies the payload',
      file: 'app/entry.client.tsx',
      note: 'The router applies the payload. No HTML was rendered and nothing reloaded.'
    }
  ]
};

const TAB_NAMES = {
  'app/routes.ts': 'routes.ts',
  'app/entry.rsc.tsx': 'entry.rsc.tsx',
  'app/entry.ssr.tsx': 'entry.ssr.tsx',
  'app/routes/_index.tsx': '_index.tsx',
  'app/entry.client.tsx': 'entry.client.tsx'
};

/**
 * A request, to let run or to step through. The file of each hop opens
 * underneath and the dot in the figure goes where the reader goes.
 */
export const RequestStepper = ({ files }: { files: readonly EditorFile[] }) => {
  const chapter = useChapter();
  const reduced = useReducedMotion() === true;
  const [mode, setMode] = useState<RequestMode>('doc');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [file, setFile] = useState(HOPS.doc[0]?.file ?? '');
  const panel = useRef<HTMLDivElement>(null);
  const visible = useInView(panel, { amount: 0.3 });
  const island = useIslandXRay('steps the request through the figure');

  const hops = HOPS[mode];
  const hop = hops[index % hops.length];
  const running = playing && visible && !reduced;

  const go = (next: number, list: readonly Hop[] = hops) => {
    const wrapped = (next + list.length) % list.length;
    setIndex(wrapped);
    setFile(list[wrapped]?.file ?? '');
  };

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => go(index + 1), 2300);
    return () => clearInterval(timer);
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- go follows index and mode
  }, [running, index, mode]);

  useEffect(() => {
    chapter.setState('hop', String(hop?.plate ?? 1));
    chapter.setState('mode', mode);
  }, [chapter, hop?.plate, mode]);
  useReplayKey(chapter.id, () => setPlaying((on) => !on));

  return (
    <div ref={panel} {...island}>
      <div className={styles.hops}>
        <div className={styles.hopsBar}>
          <Choice
            compact
            label="Kind of request"
            options={[
              { value: 'doc', label: 'document' },
              { value: 'nav', label: 'navigation' }
            ]}
            value={mode}
            onChange={(next) => {
              setMode(next);
              go(0, HOPS[next]);
            }}
          />
          <PanelButton pressed={playing} onClick={() => setPlaying(!playing)}>
            {playing ? '❚❚ pause' : '▶ play'}
          </PanelButton>
          <PanelButton
            onClick={() => {
              setPlaying(false);
              go(index + 1);
            }}>
            next ›
          </PanelButton>
        </div>
        <ol role="list">
          {hops.map((item, position) => (
            <li
              key={`${item.plate}-${item.name}`}
              className={
                /browser|client/.test(item.name) ? styles.client : styles.server
              }>
              <button
                type="button"
                className={styles.hop}
                aria-current={position === index ? 'step' : undefined}
                onClick={() => {
                  setPlaying(false);
                  go(position);
                }}>
                <b>{item.name}</b>
                <span className={styles.hopRole}>{item.role}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className={styles.note} aria-live="polite">
          {hop?.note}
        </p>
      </div>
      <Editor
        label="The file of this hop"
        files={files}
        open={file}
        onOpen={(path) => {
          setPlaying(false);
          setFile(path);
        }}
        names={TAB_NAMES}
        rows={22}
      />
    </div>
  );
};

/* ── 06 Build ────────────────────────────────────────────────────────── */

/** vite.config.ts, as it is in this project. */
export const ViteConfig = ({ file }: { file: EditorFile }) => {
  const island = useIslandXRay('a file, sent as text');
  return (
    <div {...island}>
      <Editor
        label="vite.config.ts"
        files={[file]}
        open={file.path}
        onOpen={() => {}}
      />
    </div>
  );
};

type RunMode = 'dev' | 'build' | 'start';

const echo = (text: string): Line => ({
  content: <Ink tone="muted">{`> ${text}`}</Ink>,
  wait: 200
});

const comment = (text: string): Line => ({
  content: <Ink tone="muted">{text}</Ink>,
  wait: 380
});

const RUN: Record<RunMode, { text: ReactNode; lines: readonly Line[] }> = {
  dev: {
    text: (
      <>
        Express runs Vite in middleware mode. Client code gets HMR; an edit to a
        Server Component fires <code>rsc:update</code> and the router
        revalidates without a reload.
      </>
    ),
    lines: [
      { command: 'npm run dev' },
      echo('node --env-file-if-exists=.dev.env server.js --mode=development'),
      {
        content: (
          <>
            [vitex] listening on <Ink tone="cyan">http://localhost:3001</Ink>{' '}
            (development)
          </>
        ),
        wait: 420
      },
      comment('# edit a client component   → HMR, state kept'),
      comment(
        '# edit a Server Component   → rsc:update, the router revalidates'
      )
    ]
  },
  build: {
    text: (
      <>
        <code>vite build</code> (Rolldown) writes one bundle per environment,
        then <code>scripts/compress-assets.mjs</code> puts a Brotli and a gzip
        copy next to every asset.
      </>
    ),
    lines: [
      { command: 'npm run build' },
      echo('vite build && node scripts/compress-assets.mjs'),
      comment('# rsc     → build/rsc      Server Components, loaders, actions'),
      comment('# ssr     → build/ssr      HTML rendering'),
      comment('# client  → build/client   the browser bundle, .br and .gz')
    ]
  },
  start: {
    text: (
      <>
        One Node process behind your reverse proxy. It imports{' '}
        <code>build/rsc/index.js</code> through the <code>#vitex</code> alias,
        serves the precompressed assets and requires <code>SESSION_SECRET</code>
        .
      </>
    ),
    lines: [
      { command: 'npm start' },
      echo('node --env-file-if-exists=.prod.env server.js --mode=production'),
      {
        content: (
          <>
            [vitex] listening on <Ink tone="cyan">http://127.0.0.1:3000</Ink>{' '}
            (production)
          </>
        ),
        wait: 420
      },
      { command: 'curl -s 127.0.0.1:3000/healthz' },
      { content: '{"status":"ok"}' },
      { command: 'curl -s 127.0.0.1:3000/readyz' },
      { content: '{"status":"ok"}' }
    ]
  }
};

/** The three commands of a project's life, and what each does to the figure. */
export const RunTabs = () => {
  const chapter = useChapter();
  const reduced = useReducedMotion() === true;
  const [mode, setMode] = useState<RunMode>('build');
  const [run, setRun] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const seen = useInView(panel, { once: true, amount: 0.4 });
  const tray = chapter.value('--tray');
  const mover = useMover(reduced);
  const island = useIslandXRay('runs a command, changes the figure');

  const play = (next: RunMode) => {
    setMode(next);
    setRun((count) => count + 1);
    chapter.setState('run', next);
    // Development has no build/ directory.
    mover.stop();
    void mover.to(tray, next === 'dev' ? 0 : 1, 0.7);
  };
  useEffect(() => {
    if (seen) play('build');
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- only on first sight
  }, [seen]);
  useReplayKey(chapter.id, () => play(mode));

  return (
    <div ref={panel} {...island}>
      <Choice
        label="Command"
        options={[
          { value: 'dev', label: 'npm run dev' },
          { value: 'build', label: 'npm run build' },
          { value: 'start', label: 'npm start' }
        ]}
        value={mode}
        onChange={play}
      />
      <Terminal
        label="The command you picked"
        path="~/code/my-app"
        lines={RUN[mode].lines}
        run={run}
        rows={7}
        className={styles.attached}
      />
      <p aria-live="polite">{RUN[mode].text}</p>
    </div>
  );
};

/* ── Quickstart ──────────────────────────────────────────────────────── */

/** The commands to start, with the reader's flags, and a button to copy them. */
export const Quickstart = () => {
  const flags = useAppSelector(selectFlags);
  const [copied, setCopied] = useState(false);
  const island = useIslandXRay('your flags again, from the Redux store');
  const commands = [
    createCommand(flags),
    'cd my-app',
    ...(flags.install ? [] : ['npm install']),
    'npm run dev'
  ];
  const copy = () => {
    copyToClipboard(commands.join(' && '))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  };
  return (
    <div {...island}>
      <Terminal
        label="Quickstart"
        path="with your flags"
        print="all"
        className={styles.quick}
        lines={commands.map((command) => ({ command }))}
        action={
          <TerminalButton onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </TerminalButton>
        }
      />
    </div>
  );
};
