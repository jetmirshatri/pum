import { Dim } from '@/components/Chapter/parts';
import {
  Box,
  Layer,
  Lying,
  Plumb,
  Scene,
  Tag,
  lyingLogo,
  vars
} from '@/components/Iso/Iso';
import { VitexLogo } from '@/components/VitexLogo/VitexLogo';

import * as styles from './figures.module.css';

// The eight figures of the story, one per chapter. They are Server
// Components: markup only. Their movement is CSS, driven by the custom
// properties and states of the chapter around them (see figures.module.css).

/** The class a chapter needs for the mechanics of its figure. */
export const createChapter = styles.create;

// The five bricks of a plate: three in a row at the front, two at the left.
const FRONT_LEFT = { x: -5.4, y: 2.5, w: 3.2, h: 2.9 };
const FRONT_MIDDLE = { x: -1.6, y: 2.5, w: 3.2, h: 2.9 };
const FRONT_RIGHT = { x: 2.2, y: 2.5, w: 3.2, h: 2.9 };
const BACK = { x: -5.4, y: -5.4, w: 3.2, h: 3.2 };
const SIDE = { x: -5.4, y: -1.7, w: 3.2, h: 3.4 };

const TEAL = 'var(--story-server)';
const PINK = 'var(--story-client)';
const GREEN = 'var(--story-yours)';
const RED = 'var(--story-managed)';
const AMBER = 'var(--story-demo)';
const BLUE = 'var(--story-postgres)';

/** The four layers of an app, as one block. */
const Block = ({ label, note }: { label: string; note: string }) => (
  <>
    <Box grid>
      <Tag>
        <b>Express 5</b>
        <small>server.js · Node 26</small>
      </Tag>
    </Box>
    <Box grid z="calc(28 + var(--gap))">
      <Tag>
        <b>Vite 8</b>
        <small>three environments</small>
      </Tag>
    </Box>
    <Box grid tone={TEAL} z="calc(42 + var(--gap) * 2)">
      <Tag>
        <b>React Router 8</b>
        <small>RSC Data Mode</small>
      </Tag>
    </Box>
    <Box grid tone={GREEN} z="calc(56 + var(--gap) * 3)">
      <VitexLogo className={lyingLogo} />
      <Tag>
        <b>{label}</b>
        <small>{note}</small>
      </Tag>
    </Box>
  </>
);

/** 00: the block that scrolling takes apart. */
export const AssembledFigure = () => (
  <>
    <Scene className={styles.assembled}>
      <Block label="app/" note="your code" />
    </Scene>
    <Dim>4 layers · 1 command</Dim>
  </>
);

// A brick lands when the run reaches the line with this index.
const drop = (index: number) => vars({ '--i': index });

/** 01: the tasks of create, landing as bricks. */
export const CreateFigure = () => (
  <>
    <Scene className={styles.landing}>
      <Box
        style={drop(7.2)}
        grid
        className={`${styles.drop} ${styles.dropPlate}`}>
        <Tag>
          <b>my-app/</b>
          <small>eight tasks, one directory</small>
        </Tag>
      </Box>
      <Box
        style={drop(8)}
        brick
        tone={GREEN}
        className={styles.drop}
        x={-5.2}
        y={-5.2}
        w={3.2}
        h={4.2}>
        <Lying>app/</Lying>
      </Box>
      <Box
        style={drop(8.25)}
        brick
        tone={GREEN}
        className={styles.drop}
        x={-1.6}
        y={-5.2}
        w={3.2}
        h={4.2}>
        <Lying>public/</Lying>
      </Box>
      <Box
        style={drop(8.5)}
        brick
        tone={RED}
        className={styles.drop}
        x={2}
        y={-5.2}
        w={3.2}
        h={4.2}>
        <Lying>server.js</Lying>
      </Box>
      <Box
        style={drop(8.75)}
        brick
        tone={AMBER}
        className={`${styles.drop} ${styles.dropDemo}`}
        x={-5.2}
        y={-0.6}
        w={3.2}
        h={3.6}>
        <Lying>demo</Lying>
      </Box>
      <Box
        style={drop(9)}
        brick
        tone={BLUE}
        className={`${styles.drop} ${styles.dropPostgres}`}
        x={-1.6}
        y={-0.6}
        w={3.2}
        h={3.6}>
        <Lying>postgres</Lying>
      </Box>
      <Box
        style={drop(11)}
        brick
        tone={GREEN}
        className={styles.drop}
        x={2}
        y={-0.6}
        w={3.2}
        h={3.6}>
        <Lying>site.ts</Lying>
      </Box>
      <Box
        style={drop(15)}
        brick
        tone={RED}
        className={styles.drop}
        x={-5.2}
        y={3.6}
        w={10.4}
        h={1.7}>
        <Tag side="front" color="var(--text-accent)">
          .vitex-manifest.json
        </Tag>
      </Box>
    </Scene>
    <Dim>8 tasks · 1 directory</Dim>
  </>
);

/** 02: the base template and its overlays, stacked. */
export const ComposeFigure = ({ origins }: { origins: React.ReactNode }) => (
  <>
    <Scene className={styles.stack}>
      <Layer className={styles.stackBase}>
        <Box grid>
          <Tag className={styles.origin}>
            <b>templates/vitex</b>
            <small>the base application</small>
          </Tag>
          <Tag className={styles.merged} dot="var(--text-primary)">
            <b>my-app/</b>
            <small>{origins}</small>
          </Tag>
          <Tag side="front" className={styles.wins}>
            <b>same path, the overlay wins</b>
            <small>theme.css · _index.tsx · AppShell</small>
          </Tag>
        </Box>
        <Box brick className={styles.pick} {...FRONT_LEFT} />
        <Box brick className={styles.pick} {...FRONT_MIDDLE} />
        <Box brick className={styles.pick} {...FRONT_RIGHT} />
        <Box brick className={styles.pick} {...BACK} />
        <Box brick className={styles.pick} {...SIDE} />
      </Layer>
      <Layer className={styles.stackDemo} tone={AMBER}>
        <Box grid>
          <Tag className={styles.origin}>
            <b>templates/vitex-demo</b>
            <small>--demo · feature.json</small>
          </Tag>
        </Box>
        <Box brick className={styles.pick} {...FRONT_LEFT} />
        <Box brick className={styles.pick} {...FRONT_MIDDLE} />
        <Box brick className={styles.pick} {...FRONT_RIGHT} />
        <Box brick className={styles.pick} {...BACK} />
        <Plumb
          className={styles.wins}
          x={-2.2}
          y={5.4}
          z={0}
          len="calc(var(--rise) - 20)"
        />
        <Plumb
          className={styles.wins}
          x={1.6}
          y={5.4}
          z={0}
          len="calc(var(--rise) - 20)"
        />
        <Plumb
          className={styles.wins}
          x={5.4}
          y={5.4}
          z={0}
          len="calc(var(--rise) - 20)"
        />
      </Layer>
      <Layer className={styles.stackPostgres} tone={BLUE}>
        <Box grid>
          <Tag className={styles.origin}>
            <b>templates/vitex-postgres</b>
            <small>--postgres · feature.json</small>
          </Tag>
        </Box>
        <Box brick className={styles.pick} {...SIDE} />
        <Box brick className={styles.pick} x={-1.4} y={-1.7} w={3.2} h={3.4} />
        <Box brick className={styles.pick} x={2.2} y={-5.4} w={3.2} h={3.2} />
      </Layer>
    </Scene>
    <Dim>{origins}</Dim>
  </>
);

const HASHES = [
  [2, 9.8],
  [2.8, 8.6],
  [3.6, 10.2],
  [4.4, 7.9],
  [5.2, 9.2]
] as const;

/** The manifest: a thin plate with a line per hash. */
const Receipt = ({ children }: { children: React.ReactNode }) => (
  <Layer>
    <Box className={styles.receipt}>{children}</Box>
    {HASHES.map(([y, w], row) => (
      <i
        key={y}
        className={styles.hash}
        style={vars({ '--y': y, '--w': w, '--row': row })}
      />
    ))}
  </Layer>
);

/** The tier the project owns. */
const Yours = ({ note }: { note: string }) => (
  <Layer className={styles.tierYours} tone={GREEN}>
    <Box grid>
      <Tag>
        <b>yours</b>
        <small>{note}</small>
      </Tag>
    </Box>
    <Box
      brick
      className={styles.pick}
      x={-5.4}
      y={-5.4}
      w={6.4}
      h={10.8}
      thick={9}
      z={23.5}>
      <Lying>app/</Lying>
    </Box>
    <Box brick className={styles.pick} x={1.6} y={-5.4} w={3.8} h={5.1}>
      <Lying>public/</Lying>
    </Box>
    <Box
      brick
      className={`${styles.pick} ${styles.drizzle}`}
      x={1.6}
      y={0.3}
      w={3.8}
      h={5.1}>
      <Lying>drizzle/</Lying>
    </Box>
  </Layer>
);

/** 03: who owns what, and the manifest that records it. */
export const OwnFigure = () => (
  <Scene className={styles.tiers}>
    <Receipt>
      <Tag>
        <b>.vitex-manifest.json</b>
        <small>one sha256 per managed file</small>
      </Tag>
    </Receipt>
    <Layer className={styles.tierManaged} tone={RED}>
      <Box grid className={styles.frame}>
        <Tag>
          <b>template-managed</b>
          <small>
            server.js · vite.config.ts · root config · .github/ · .vscode/ ·
            scripts/
          </small>
        </Tag>
      </Box>
      <Box brick className={styles.pick} {...FRONT_LEFT} />
      <Box brick className={styles.pick} {...FRONT_MIDDLE} />
      <Box brick className={styles.pick} {...FRONT_RIGHT} />
      <Box brick className={styles.pick} {...BACK} />
      <Box brick className={styles.pick} {...SIDE} />
      <Plumb x={-3.8} y={6.2} len="var(--rise)" />
      <Plumb x={0} y={6.2} len="var(--rise)" />
      <Plumb x={3.8} y={6.2} len="var(--rise)" />
    </Layer>
    <Yours note="app/ · public/ · drizzle/: the updater never touches them" />
  </Scene>
);

/** 04: an update moves the managed tier and nothing else. */
export const UpdateFigure = () => (
  <>
    <Scene className={`${styles.tiers} ${styles.tiersUpdate}`}>
      <Receipt>
        <Tag side="front">
          <b>.vitex-manifest.json</b>
          <small>compared, then refreshed</small>
        </Tag>
      </Receipt>
      <Layer className={styles.tierManaged} tone={RED}>
        <Box grid className={styles.frame} />
        <Box brick className={styles.moved} {...FRONT_LEFT}>
          <Tag
            to="calc(var(--sw) * (1 - var(--cf)))"
            color="var(--story-update)">
            ~ server.js
          </Tag>
          <Tag to="var(--cf)" color="var(--text-accent)">
            ✖ server.js, locally modified
          </Tag>
        </Box>
        <Box brick className={styles.backup} x={-5.4} y={6.5} w={3.2} h={1.5}>
          <Tag side="front" to="var(--bak)">
            server.js.bak-…
          </Tag>
        </Box>
        <Box brick {...FRONT_MIDDLE} />
        <Box brick className={styles.added} {...FRONT_RIGHT}>
          <Tag to="var(--add)" color="var(--story-add)">
            + scripts/compress-assets.mjs
          </Tag>
        </Box>
        <Box brick {...BACK} />
        <Box brick {...SIDE} />
      </Layer>
      <Yours note="not in any plan, never moved" />
    </Scene>
    <span
      className={`${styles.stamp} ${styles.stampBlocked}`}
      style={vars({ '--t': 0, '--sx': '8%', '--sy': '15%', '--a': '-5deg' })}>
      Update blocked · no files changed
    </span>
  </>
);

/** 05: the path of a request through four real files. */
export const RouteFigure = () => (
  <Scene className={styles.hops}>
    <Box grid className={styles.plateSsr}>
      <Tag>
        <b>
          <i>4</i>entry.ssr.tsx
        </b>
        <small>payload → HTML stream</small>
      </Tag>
    </Box>
    <Box grid className={styles.plateRsc}>
      <Tag>
        <b>
          <i>3</i>entry.rsc.tsx
        </b>
        <small>loaders → RSC payload</small>
      </Tag>
      <Tag side="left" className={styles.forDoc}>
        HTML ↑
      </Tag>
      <Tag side="left" className={styles.forNav} color={TEAL}>
        payload ↑
      </Tag>
    </Box>
    <Box grid className={styles.plateServer}>
      <Tag>
        <b>
          <i>2</i>server.js
        </b>
        <small>Express 5 · CSP nonce</small>
      </Tag>
    </Box>
    <Layer className={styles.browser}>
      <Box grid tone="var(--text-primary)">
        <Tag>
          <b>
            <i>1</i>Browser
          </b>
          <small>GET / · paints, then hydrates</small>
        </Tag>
      </Box>
      <Box
        brick
        tone={TEAL}
        className={styles.region}
        x={-5.2}
        y={-5.2}
        w={10.4}
        h={2.2}
      />
      <Box
        brick
        tone={TEAL}
        className={styles.region}
        x={-5.2}
        y={-2.4}
        w={6}
        h={7.6}
      />
      <Box
        brick
        tone={PINK}
        className={styles.island}
        x={1.4}
        y={-2.4}
        w={3.8}
        h={3.5}
      />
      <Box
        brick
        tone={PINK}
        className={styles.island}
        x={1.4}
        y={1.7}
        w={3.8}
        h={3.5}
      />
    </Layer>
    <Plumb x={-4.5} y={4.5} z="var(--h3)" len="calc(var(--rise) * 3)" />
    <Plumb x={-6.6} y={-6.6} z="var(--h3)" len="calc(var(--rise) * 3)" />
    <i className={styles.dot} />
    {[0, 1, 2].map((row) => (
      <i key={row} className={styles.chunk} style={vars({ '--row': row })} />
    ))}
  </Scene>
);

/** 06: one config, three environments, three bundles. */
export const BuildFigure = () => (
  <>
    <Scene className={styles.fan}>
      <Box dashed className={styles.tray} x={-8.2} y={-6.6} w={16.4} h={13.2}>
        <Lying>build/</Lying>
      </Box>
      <Box className={`${styles.strip} ${styles.stripClient}`}>
        <Tag className={styles.stripTag}>
          <b>
            client<span className={styles.into}> → build/client</span>
          </b>
          <small>the browser bundle</small>
        </Tag>
      </Box>
      <Box className={`${styles.strip} ${styles.stripRsc}`}>
        <Tag className={styles.stripTag}>
          <b>
            rsc<span className={styles.into}> → build/rsc</span>
          </b>
          <small>loaders · actions · RSC</small>
        </Tag>
      </Box>
      <Box className={`${styles.strip} ${styles.stripSsr}`}>
        <Tag className={styles.stripTag}>
          <b>
            ssr<span className={styles.into}> → build/ssr</span>
          </b>
          <small>HTML rendering</small>
        </Tag>
      </Box>
      <Box grid className={styles.config}>
        <Lying>vite.config.ts</Lying>
        <Tag side="up">
          <b>vite.config.ts</b>
          <small>
            react(&#123; compiler: true &#125;) · rsc(&#123; entries &#125;)
          </small>
        </Tag>
      </Box>
      <Plumb
        className={styles.fall}
        x="calc(-4.2 - var(--spread) * 1.6)"
        y={6.2}
      />
      <Plumb className={styles.fall} x={0} y={6.2} />
      <Plumb
        className={styles.fall}
        x="calc(4.2 + var(--spread) * 1.6)"
        y={6.2}
      />
    </Scene>
    <Dim>1 config · 3 outputs</Dim>
  </>
);

const STAMPS = [
  ['Oxlint ✓', 0.1, '8%', '17%', '-7deg'],
  ['Oxfmt ✓', 0.2, '50%', '13%', '5deg'],
  ['Stylelint ✓', 0.3, '66%', '27%', '-4deg'],
  ['tsrs · TypeScript 7 ✓', 0.4, '6%', '33%', '4deg'],
  ['Vitest ✓', 0.55, '9%', '73%', '-5deg'],
  ['Runtime checks ✓', 0.67, '44%', '79%', '5deg'],
  ['CI ✓', 0.8, '71%', '68%', '-8deg']
] as const;

/** 07: the block again, stamped by every check. */
export const ShipFigure = () => (
  <>
    <Scene className={`${styles.assembled} ${styles.inspected}`}>
      <Block label="my-app/" note="assembled, inspected" />
    </Scene>
    {STAMPS.map(([text, at, x, y, angle]) => (
      <span
        key={text}
        className={styles.stamp}
        style={vars({ '--t': at, '--sx': x, '--sy': y, '--a': angle })}>
        {text}
      </span>
    ))}
  </>
);
