'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { TechnologyIcon } from '@/components/TechnologyIcon/TechnologyIcon';
import { useIslandXRay } from '@/components/XRay/useIslandXRay';
import { useShowcaseMotion } from '@/hooks/useShowcaseMotion';

import * as styles from './architecturescene.module.css';

import type { Technology } from '@/components/TechnologyIcon/TechnologyIcon';

type ShowcaseCommand = {
  label: string;
  command: string;
  title: string;
  body: string;
  tools: readonly string[];
  output: string;
};

const COMMANDS = [
  {
    label: 'create',
    command: 'vitex create my-app',
    title: 'Your starting point, already assembled.',
    body: 'The CLI copies the Vitex template into your project and records a manifest so future updates can detect local changes.',
    tools: [],
    output: 'my-app/'
  },
  {
    label: 'dev',
    command: 'npm run dev',
    title: 'One save. A shorter feedback loop.',
    body: 'Express runs the development server with Vite middleware. React Router resolves your routes while Vite updates the browser as you edit.',
    tools: ['vite', 'router', 'react', 'express'],
    output: 'localhost:3001'
  },
  {
    label: 'check',
    command: 'npm run lint',
    title: 'Keep the whole project in agreement.',
    body: 'Oxlint and Oxfmt check your code, Stylelint checks your CSS, and TypeScript checks the application and its explicit route contracts.',
    tools: [],
    output: 'Code + CSS + types'
  },
  {
    label: 'build',
    command: 'npm run build',
    title: 'One source. Three build targets.',
    body: 'Vite and its RSC plugin build browser assets in build/client, Server Components in build/rsc, and the HTML renderer in build/ssr.',
    tools: ['vite', 'router', 'react'],
    output: 'client + RSC + SSR'
  },
  {
    label: 'serve',
    command: 'npm start',
    title: 'The server begins. The browser takes over.',
    body: 'Express handles the request, React Router loads data and renders Server Components, and the SSR entry streams HTML. The browser hydrates Client Components with its own Redux store.',
    tools: ['router', 'react', 'express'],
    output: 'HTML + RSC + interactive UI'
  },
  {
    label: 'update',
    command: 'vitex update --dry-run',
    title: 'Move forward with a plan.',
    body: 'The CLI compares your project with the template and its manifest. Local conflicts block by default; a clean dry run previews changes without writing files.',
    tools: [],
    output: 'An update preview'
  }
] as const satisfies readonly ShowcaseCommand[];

const FOUNDATIONS: readonly {
  kind: Technology;
  name: string;
  role: string;
  x: number;
  y: number;
  connection: string;
}[] = [
  {
    kind: 'router',
    name: 'React Router',
    role: 'Routes + data',
    x: 615,
    y: 412,
    connection: 'M615 290V412'
  },
  {
    kind: 'vite',
    name: 'Vite',
    role: 'Dev + build',
    x: 455,
    y: 448,
    connection: 'M455 282V448'
  },
  {
    kind: 'express',
    name: 'Express',
    role: 'HTTP server',
    x: 735,
    y: 474,
    connection: 'M694 264V453L735 474'
  },
  {
    kind: 'react',
    name: 'React + Redux',
    role: 'UI + state',
    x: 580,
    y: 520,
    connection: 'M580 346V520'
  }
];

const INPUTS = [
  { name: '.tsx', x: 145, y: 162, path: 'M145 162 292 236 353 205' },
  { name: '.ts', x: 212, y: 280, path: 'M212 280 320 334 425 280' },
  { name: '.css', x: 148, y: 410, path: 'M148 410 256 464 482 348' }
] as const;

const OUTPUTS = [
  { name: '.html', x: 860, y: 132, path: 'M583 117 703 57 860 132' },
  { name: '.js', x: 938, y: 266, path: 'M678 164 777 114 938 196V266' },
  { name: '.css', x: 892, y: 410, path: 'M761 206 834 242V380L892 410' }
] as const;

const TILE_FACE = 'M-55 0 0-29 55 0 0 29Z';
const TILE_EDGE = 'M-55 0V11L0 40 55 11V0L0 29Z';
const BOARD_FACE = 'M560 100 794 217 560 334 326 217Z';
const BOARD_EDGE = 'M326 217V249L560 366 794 249V217L560 334Z';

export const ArchitectureScene = () => {
  const { ref, reduced, paused, setPaused, running } = useShowcaseMotion();
  const [selected, setSelected] = useState(1);
  const command: ShowcaseCommand = COMMANDS[selected] ?? COMMANDS[1];
  const sourceActive = command.label !== 'serve';
  const outputActive = ['dev', 'build', 'serve'].includes(command.label);
  const islandXRay = useIslandXRay('plays each command on a timer');

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSelected((current) => (current + 1) % COMMANDS.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [running]);

  return (
    <section
      ref={ref}
      className={styles.scene}
      aria-label="Vitex architecture in motion"
      {...islandXRay}>
      <div className={styles.topline}>
        <span>FROM SOURCE TO SOMETHING REAL</span>
        <button
          type="button"
          disabled={reduced}
          onClick={() => setPaused((current) => !current)}
          aria-label={
            reduced
              ? 'Reduced motion enabled'
              : paused
                ? 'Play architecture animation'
                : 'Pause architecture animation'
          }>
          <span aria-hidden="true">{paused || reduced ? '▷' : 'Ⅱ'}</span>
          {reduced
            ? 'Reduced motion'
            : paused
              ? 'Play animation'
              : 'Pause animation'}
        </button>
      </div>

      <div className={styles.artwork}>
        <svg
          className={styles.diagram}
          viewBox="0 0 1080 620"
          aria-hidden="true">
          {[...INPUTS, ...OUTPUTS].map((file, index) => {
            const active = index < INPUTS.length ? sourceActive : outputActive;
            return (
              <g
                key={`${file.x}-${file.name}`}
                className={styles.wire}
                data-active={active}>
                <path d={file.path} />
                {running && active ? (
                  <motion.path
                    className={styles.packet}
                    d={file.path}
                    strokeDasharray="22 510"
                    animate={{ strokeDashoffset: [532, 0] }}
                    transition={{
                      duration: 2.8,
                      delay: index * 0.22,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                ) : null}
              </g>
            );
          })}

          {FOUNDATIONS.map((tool) => (
            <path
              key={tool.kind}
              className={styles.dropLine}
              data-active={command.tools.includes(tool.kind)}
              d={tool.connection}
            />
          ))}

          {FOUNDATIONS.map((tool) => (
            <g key={tool.kind} transform={`translate(${tool.x} ${tool.y})`}>
              <motion.g
                className={styles.foundation}
                data-active={command.tools.includes(tool.kind)}
                initial={false}
                animate={{
                  y: !reduced && command.tools.includes(tool.kind) ? -8 : 0
                }}
                transition={{ duration: reduced ? 0 : 0.65 }}>
                <g transform="scale(1.7 1.6)">
                  <path className={styles.tileEdge} d={TILE_EDGE} />
                  <path className={styles.tileFace} d={TILE_FACE} />
                </g>
                <g transform="rotate(-27)">
                  <TechnologyIcon
                    kind={tool.kind}
                    x="-15"
                    y="-29"
                    width="29"
                    height="29"
                  />
                  <text
                    className={styles.foundationName}
                    textAnchor="middle"
                    y="18">
                    {tool.name}
                  </text>
                </g>
              </motion.g>
            </g>
          ))}

          <g>
            <path className={styles.boardEdge} d={BOARD_EDGE} />
            <path className={styles.boardFace} d={BOARD_FACE} />
            <path
              className={styles.boardInset}
              d="M560 114 765 217 560 321 355 217Z"
            />
            <text
              className={styles.boardLabel}
              x="398"
              y="286"
              transform="rotate(27 398 286)">
              VITEX / YOUR APPLICATION
            </text>
            {COMMANDS.map((item, index) => {
              const column = index % 3;
              const row = Math.floor(index / 3);
              const x = 560 + (column - 1) * 76 - (row - 0.5) * 91;
              const y = 217 + (column - 1) * 38 + (row - 0.5) * 46;
              return (
                <g key={item.label} transform={`translate(${x} ${y})`}>
                  <motion.g
                    className={styles.commandTile}
                    data-active={selected === index}
                    initial={false}
                    animate={{ y: reduced ? 0 : selected === index ? -17 : -2 }}
                    transition={{
                      duration: reduced ? 0 : 0.45,
                      ease: 'easeOut'
                    }}>
                    <path className={styles.tileEdge} d={TILE_EDGE} />
                    <path className={styles.tileFace} d={TILE_FACE} />
                    <text
                      className={styles.tileLabel}
                      textAnchor="middle"
                      y="4"
                      transform="rotate(-27)">
                      {item.label}
                    </text>
                  </motion.g>
                </g>
              );
            })}
          </g>

          {[...INPUTS, ...OUTPUTS].map((file, index) => (
            <g
              key={`${file.x}-${file.name}`}
              transform={`translate(${file.x} ${file.y})`}>
              <motion.g
                className={styles.file}
                data-side={index < INPUTS.length ? 'source' : 'output'}
                data-active={
                  index < INPUTS.length ? sourceActive : outputActive
                }
                initial={false}
                animate={running ? { y: [0, -5, 0] } : { y: 0 }}
                transition={{
                  duration: running ? 3.5 : 0,
                  delay: running ? index * 0.3 : 0,
                  repeat: running ? Infinity : 0,
                  ease: 'easeInOut'
                }}>
                <path className={styles.tileEdge} d={TILE_EDGE} />
                <path className={styles.tileFace} d={TILE_FACE} />
                <text
                  className={styles.fileLabel}
                  textAnchor="middle"
                  y="4"
                  transform="rotate(-27)">
                  {file.name}
                </text>
              </motion.g>
            </g>
          ))}
          <text className={styles.sideLabel} x="142" y="93" textAnchor="middle">
            YOUR SOURCE
          </text>
          <text className={styles.sideLabel} x="925" y="78" textAnchor="middle">
            WEB OUTPUT
          </text>
          <text
            className={styles.bottomLabel}
            x="560"
            y="604"
            textAnchor="middle">
            INDEPENDENT TOOLS. ONE CONNECTED FOUNDATION.
          </text>
        </svg>
      </div>

      <ul
        role="list"
        className={styles.legend}
        aria-label="Application foundations">
        {FOUNDATIONS.map((tool) => (
          <li key={tool.kind} data-active={command.tools.includes(tool.kind)}>
            <TechnologyIcon kind={tool.kind} />
            <span>
              {tool.name}
              <small>{tool.role}</small>
            </span>
          </li>
        ))}
      </ul>

      <fieldset
        className={styles.commands}
        aria-label="Explore a Vitex command">
        {COMMANDS.map((item, index) => (
          <button
            type="button"
            key={item.label}
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index);
              setPaused(true);
            }}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </button>
        ))}
      </fieldset>

      <div
        className={styles.detail}
        aria-live={paused ? 'polite' : 'off'}
        aria-atomic="true">
        <div className={styles.detailCopy}>
          <h2>{command.title}</h2>
          <p>{command.body}</p>
        </div>
        <div className={styles.result}>
          <code>
            <span aria-hidden="true">$ </span>
            {command.command}
          </code>
          <span className={styles.resultLabel}>
            <i aria-hidden="true" />
            {command.output}
          </span>
        </div>
      </div>
    </section>
  );
};
