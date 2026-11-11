import { Link } from 'react-router';

import { Chapter } from '@/components/Chapter/Chapter';
import { Beat, Kicker, Lede, Spec, Title } from '@/components/Chapter/parts';
import {
  AssembledFigure,
  BuildFigure,
  ComposeFigure,
  CreateFigure,
  OwnFigure,
  RouteFigure,
  ShipFigure,
  UpdateFigure,
  createChapter
} from '@/components/Figures/Figures';
import { xray } from '@/components/XRay/xray';
import { QUICKSTART_ID } from '@/config/navigation';
import { log } from '@/utils/logger.server';
import { storyFiles } from '@/utils/story-files.server';

import * as styles from './_index.module.css';
import {
  Breathe,
  CreateRun,
  Explorer,
  FeatureFiles,
  HeroCommand,
  LayerMatrix,
  Origins,
  Quickstart,
  RequestStepper,
  RunTabs,
  StoryRoot,
  UpdateScenarios,
  ViteConfig
} from './_index.view';

import type { LoaderFunctionArgs } from 'react-router';

export { meta } from './_index.view';

export const loader = (_args: LoaderFunctionArgs) => {
  log('info', 'visited /');
  return null;
};

const SERVER = xray('server', 'rendered on the server, sent as HTML');

const DEMOS = [
  ['/demo/architecture', 'Architecture', 'Every layer and what it hands on.'],
  ['/demo/cli', 'CLI', 'Configure a command, see what it writes.'],
  ['/demo/streaming', 'Streaming', 'Suspense boundaries arriving in order.'],
  ['/demo/actions', 'Actions', 'An optimistic update and its round trip.'],
  ['/demo/routes/1', 'Typed routes', 'Loader data and validated params.']
] as const;

// The home page is a Server Component. It writes the story and draws the
// figures; the panels a reader can touch are the client islands of
// _index.view.tsx, inside chapters that follow the scroll.
export default function IndexRoute() {
  const files = storyFiles();
  return (
    <StoryRoot>
      <Chapter
        hero
        id="top"
        rest={0}
        values={{ '--breath': 0, '--sway': 0 }}
        number="Fig. 0"
        caption="my-app, assembled"
        unit="explode"
        label="An isometric block labelled Vitex that separates into four layers: your app, React Router 8, Vite 8 and Express 5."
        figure={<AssembledFigure />}
        head={
          <>
            <Kicker number="00">Vitex · CLI + application template</Kicker>
            <Title hero>
              One command.
              <br />A whole app,
              <br />
              <em>taken apart.</em>
            </Title>
            <Lede>
              Vitex is a CLI and an application template: React Router 8 in RSC
              Data Mode, streaming SSR, Vite 8 and Express 5 on Node 26. Scroll,
              and the app comes apart layer by layer.
            </Lede>
            <HeroCommand />
          </>
        }>
        <Breathe />
        <Beat>
          <h3>The drawing you are about to read</h3>
          <Spec>
            <dt>Drawing</dt>
            <dd>my-app, exploded view</dd>
            <dt>Made by</dt>
            <dd>
              <code>vitex create</code>
            </dd>
            <dt>Parts</dt>
            <dd>1 CLI · 1 base template · 2 overlays</dd>
            <dt>Routing</dt>
            <dd>React Router 8 · RSC Data Mode</dd>
            <dt>Build</dt>
            <dd>Vite 8 · 3 environments</dd>
            <dt>Runtime</dt>
            <dd>Express 5 · Node 26</dd>
          </Spec>
        </Beat>
        <Beat>
          <h3>Three ways to read it</h3>
          <Spec>
            <dt>Scroll</dt>
            <dd>
              Each figure is tied to the scrollbar: a chapter takes the project
              apart a little further.
            </dd>
            <dt>Click</dt>
            <dd>
              Dark panels are terminals, framed panels are files. Flags, choices
              and files are live, and the drawing follows them.
            </dd>
            <dt>Type</dt>
            <dd>
              <kbd>j</kbd> <kbd>k</kbd> move between chapters, <kbd>1</kbd>–
              <kbd>7</kbd> jump to one, <kbd>r</kbd> replays, <kbd>g</kbd>{' '}
              <kbd>G</kbd> go to the top and the end.
            </dd>
          </Spec>
        </Beat>
      </Chapter>

      <Chapter
        id="create"
        className={createChapter}
        rest={1}
        values={{ '--n': 18, '--run': 0 }}
        state={{ run: 'off' }}
        number="Fig. 1"
        caption="vitex create, brick by brick"
        unit="written"
        label="The tasks of vitex create land as bricks on a plate named my-app: app, public, the template-managed files, the demo and postgres overlays, the project's identity and, last, the manifest."
        figure={<CreateFigure />}
        head={
          <>
            <Kicker number="01">Create</Kicker>
            <Title>Eleven questions. Eight tasks. One directory.</Title>
            <Lede>
              <code>vitex create</code> asks what it cannot know: version,
              title, description, author, private, repository, language, demo
              pages, PostgreSQL, git, install. With <code>--yes</code> it asks
              nothing and takes the defaults. Then it prints exactly what it
              did.
            </Lede>
          </>
        }>
        <Beat first>
          <h3>Run it with your flags</h3>
          <p>
            Choose what the project gets. The command, its output, the drawing
            and the rest of this page follow your choice. Scrolling prints the
            run; <b>run</b> replays it.
          </p>
          <CreateRun />
        </Beat>
        <Beat>
          <h3>Nothing is implied</h3>
          <p>
            <code>--yes</code> does not install and does not initialise git.{' '}
            <code>--install</code>, <code>--git</code> and <code>--github</code>{' '}
            are explicit; <code>--github</code> creates a private repository
            through <code>gh</code> and implies <code>--git</code>. Each adds
            its own line to the list, and a task gets its check mark only after
            it succeeds.
          </p>
        </Beat>
        <Beat>
          <h3>It ends with a receipt</h3>
          <p>
            The last task writes <code>.vitex-manifest.json</code>. Remember
            that file: it is what makes every later update safe.
          </p>
        </Beat>
      </Chapter>

      <Chapter
        id="compose"
        rest={0.66}
        state={{ pick: 'demo' }}
        number="Fig. 2"
        caption="base + overlays"
        unit="stack"
        label="Three plates stack up: the base template, the demo overlay and the postgres overlay. Demo tiles sit exactly above the template tiles they replace. Then the stack compresses into my-app."
        figure={<ComposeFigure origins={<Origins />} />}
        head={
          <>
            <Kicker number="02">Template and overlays</Kicker>
            <Title>A project is a stack of layers.</Title>
            <Lede>
              The CLI package carries one base application,{' '}
              <code>templates/vitex</code>, and two overlays.{' '}
              <code>create</code> copies the base, lays the overlays over it,
              and writes the project&apos;s own identity on top.
            </Lede>
          </>
        }>
        <Beat first>
          <h3>Which layer wins, path by path</h3>
          <p>
            An overlay is extra files plus a <code>feature.json</code>. Where it
            has a file at the same path as the template, its file replaces the
            template&apos;s. Pick a path, or switch an overlay off and watch the
            stack change.
          </p>
          <LayerMatrix />
        </Beat>
        <Beat>
          <h3>What an overlay declares</h3>
          <p>
            The JSON names the package fields to merge, the env lines to append
            and a README section. <code>--demo</code> brings pages and no
            dependencies; <code>--postgres</code> brings Drizzle and four{' '}
            <code>db:*</code> scripts.
          </p>
          <FeatureFiles files={files.features} />
        </Beat>
        <Beat>
          <h3>Then it becomes yours</h3>
          <p>
            On top go <code>app/config/site.ts</code> (title, description,
            lang), <code>package.json</code>, the template&apos;s tested{' '}
            <code>package-lock.json</code> renamed to the project, LICENSE,
            README, <code>.dev.env</code>, <code>.prod.env</code> and{' '}
            <code>.gitignore</code>. The stack compresses into one directory.
          </p>
        </Beat>
      </Chapter>

      <Chapter
        id="own"
        rest={0.92}
        state={{ tier: 'rec' }}
        number="Fig. 3"
        caption="ownership and receipt"
        unit="open"
        label="The project opens into three tiers: on top the green part you own, in the middle the red files the template manages, and underneath the manifest with one hash line per managed file."
        figure={<OwnFigure />}
        head={
          <>
            <Kicker number="03">Manifest and ownership</Kicker>
            <Title>Who owns what is written down.</Title>
            <Lede>
              <code>.vitex-manifest.json</code> records provenance: a sha256
              hash of every template-managed file, plus the template-owned
              package fields. That is how the CLI tells untouched template code
              from your edits.
            </Lede>
          </>
        }>
        <Beat first>
          <h3>Open any file</h3>
          <p>
            These are this project&apos;s own files, read on the server. The bar
            beside a file says who owns it; the line under the code says what an
            update will do with it. The drawing lights the tier it belongs to.
          </p>
          <Explorer files={files.project} />
        </Beat>
        <Beat>
          <h3>The line is drawn at create</h3>
          <p>
            From <code>create</code> on, the project owns <code>app/</code>,{' '}
            <code>public/</code> and <code>drizzle/</code>: the updater never
            touches them. The template keeps maintaining <code>server.js</code>,{' '}
            <code>vite.config.ts</code>, the root configuration,{' '}
            <code>.github/</code>, <code>.vscode/</code> and{' '}
            <code>scripts/</code>, and signs for each with a hash in the
            manifest.
          </p>
        </Beat>
      </Chapter>

      <Chapter
        id="update"
        rest={1}
        values={{ '--out': 0, '--sw': 1, '--add': 1, '--cf': 0, '--bak': 0 }}
        state={{ mode: 'clean' }}
        number="Fig. 4"
        caption="update, planned"
        captionBy="mode"
        captions={{
          clean: 'update, planned',
          conflict: 'update, blocked',
          force: 'update, forced'
        }}
        unit="open"
        label="A managed brick slides out, comes back updated and a new brick lands, while the green tier you own stays still. A locally modified brick blocks the update: nothing moves."
        figure={<UpdateFigure />}
        head={
          <>
            <Kicker number="04">Update</Kicker>
            <Title>Plan first. Write second. Or not at all.</Title>
            <Lede>
              <code>vitex update</code> plans the complete migration before it
              writes anything, then asks. <code>--dry-run</code> only shows the
              plan. <code>vitex add postgres</code> is an update that also
              brings the feature.
            </Lede>
          </>
        }>
        <Beat first>
          <h3>Three ways it can go</h3>
          <p>
            <code>+</code> add, <code>~</code> update, <code>-</code> delete,{' '}
            <code>=</code> keep, <code>✔</code> unchanged, <code>✖</code>{' '}
            conflict. The template has a newer <code>server.js</code>. Pick what
            happened to yours:
          </p>
          <UpdateScenarios hash={files.serverHash} />
        </Beat>
        <Beat>
          <h3>One conflict blocks everything</h3>
          <p>
            A managed file you changed stops the whole update unless you pass{' '}
            <code>--force</code>. Before overwriting, the CLI writes a
            timestamped <code>.bak-*</code> copy; if a write fails, the
            transaction rolls back. <code>npm install</code> runs only with{' '}
            <code>--install</code>.
          </p>
        </Beat>
      </Chapter>

      <Chapter
        id="route"
        rest={0.4}
        state={{ hop: '1', mode: 'doc' }}
        number="Fig. 5"
        caption="one document request"
        captionBy="mode"
        captions={{
          doc: 'one document request',
          nav: 'a navigation, payload only'
        }}
        unit="open"
        label="A red dot drops from the browser through server.js and app/entry.rsc.tsx to app/entry.ssr.tsx; HTML chunks rise back to the browser and the client islands light up. For a navigation the dot stops at entry.rsc.tsx and only the payload returns."
        figure={<RouteFigure />}
        head={
          <>
            <Kicker number="05">React Router 8</Kicker>
            <Title>One request, hop by hop.</Title>
            <Lede>
              RSC Data Mode. Routes are declared in code, in{' '}
              <code>app/routes.ts</code>, and every route is lazy. Route
              components are Server Components by default;{' '}
              <code>&apos;use client&apos;</code> marks the islands.
            </Lede>
          </>
        }>
        <Beat first>
          <h3>Every hop is a real file</h3>
          <p>
            Let the request run, or step through it yourself. The file of each
            hop opens underneath, and the dot in the drawing goes where you go.
          </p>
          <RequestStepper files={files.route} />
        </Beat>
        <Beat>
          <h3>After that, only the payload travels</h3>
          <p>
            A navigation or an action fetches just the RSC payload (
            <code>text/x-component</code>) from hop 3: no HTML, no full reload.
            Bots get the complete document at once. A route module exports{' '}
            <code>loader</code>, <code>action</code>, <code>default</code>,{' '}
            <code>ErrorBoundary</code>, <code>meta</code> and <code>links</code>
            ; a page&apos;s UI and CSS Module live in its client view,{' '}
            <code>name.view.tsx</code>.
          </p>
        </Beat>
      </Chapter>

      <Chapter
        id="build"
        rest={0.94}
        values={{ '--tray': 1 }}
        state={{ run: 'build' }}
        number="Fig. 6"
        caption="three environments, built"
        captionBy="run"
        captions={{
          dev: 'three environments, live',
          build: 'three environments, built',
          start: 'one process, in production'
        }}
        unit="build"
        label="Three strips named client, rsc and ssr descend from under the vite.config.ts plate, fan out and land on a tray named build as build/client, build/rsc and build/ssr."
        figure={<BuildFigure />}
        head={
          <>
            <Kicker number="06">Vite 8</Kicker>
            <Title>One config, three environments.</Title>
            <Lede>
              <code>vite.config.ts</code> declares <code>client</code> (the
              browser bundle), <code>rsc</code> (Server Components, loaders,
              actions) and <code>ssr</code> (HTML rendering). React Compiler
              runs in the client environment only.
            </Lede>
          </>
        }>
        <Beat first>
          <h3>The whole build, in one file</h3>
          <ViteConfig file={files.vite} />
        </Beat>
        <Beat>
          <h3>Dev, build, start</h3>
          <RunTabs />
          <p>
            Styles: CSS Modules, PostCSS Preset Env and Lightning CSS, on a
            design system in <code>app/styles</code> with a WCAG contrast test.
          </p>
        </Beat>
      </Chapter>

      <Chapter
        id="ship"
        rest={1}
        values={{ '--breath': 0, '--sway': 0 }}
        number="Fig. 7"
        caption="inspected"
        unit="checks"
        label="The assembled my-app block, stamped one by one: Oxlint, Oxfmt, Stylelint, tsrs, Vitest, runtime checks and CI."
        figure={<ShipFigure />}
        head={
          <>
            <Kicker number="07">Verify, ship, start</Kicker>
            <Title>Checked before it ships.</Title>
            <Lede>
              The project arrives with its own inspection: two commands, and a
              workflow that runs them on every push.
            </Lede>
          </>
        }>
        <Breathe />
        <Beat>
          <h3>Two commands</h3>
          <Spec>
            <dt>npm run lint</dt>
            <dd>
              Oxlint, Oxfmt, Stylelint and <code>tsrs</code> (TypeScript 7).
            </dd>
            <dt>npm test</dt>
            <dd>
              Vitest, then runtime checks (<code>scripts/check-*.mjs</code>)
              that boot the compiled production server and test HTML and RSC
              responses, actions, cookies, CSP nonces and bundle boundaries.
            </dd>
            <dt>CI</dt>
            <dd>
              <code>.github/workflows/ci.yml</code> runs lint, build and tests.
            </dd>
          </Spec>
        </Beat>
      </Chapter>

      <section className={styles.closing} id={QUICKSTART_ID}>
        <div {...SERVER}>
          <Kicker number="→">Quickstart</Kicker>
          <h2>Now put it back together.</h2>
        </div>
        <div>
          <Quickstart />
          <p {...SERVER}>
            The command follows the flags you set in{' '}
            <Link to={{ hash: '#create' }}>chapter 1</Link>. Later:{' '}
            <code>vitex update --dry-run</code>.
          </p>
        </div>
      </section>

      <nav className={styles.demos} aria-label="Live demos" {...SERVER}>
        {DEMOS.map(([to, name, text]) => (
          <Link key={to} to={to} prefetch="intent" className={styles.demoLink}>
            <code className={styles.demoPath}>{to}</code>
            <b className={styles.demoName}>{name}</b>
            <span className={styles.demoText}>{text}</span>
          </Link>
        ))}
      </nav>
    </StoryRoot>
  );
}
