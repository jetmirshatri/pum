'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Form, useNavigation } from 'react-router';

import { useIslandXRay } from '@/components/XRay/useIslandXRay';
import { useMotionPreference } from '@/hooks/useShowcaseMotion';
import { copyToClipboard } from '@/utils/clipboard.client';

import * as styles from './demo.cli.module.css';

import type { MetaFunction } from 'react-router';

import type { loader } from './demo.cli';

export const meta: MetaFunction = () => [
  { title: 'CLI workflow | Vitex' },
  {
    name: 'description',
    content:
      'Build your Vitex create command and explore exactly what it sets up.'
  }
];

const SIMPLE_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

const OPTIONS = [
  {
    key: 'yes',
    flag: '--yes',
    title: 'Use the defaults',
    detail: 'Skip the interactive prompts.'
  },
  {
    key: 'install',
    flag: '--install',
    title: 'Install dependencies',
    detail: 'Run npm install after scaffolding.'
  },
  {
    key: 'git',
    flag: '--git',
    title: 'Start a Git history',
    detail: 'Initialize Git and create the first commit.'
  },
  {
    key: 'github',
    flag: '--github',
    title: 'Make it a GitHub repository',
    detail: 'Create a private repository, set origin, and push. Includes Git.'
  }
] as const;

const UPDATE_PLANS = [
  {
    label: 'Preview',
    command: 'vitex update --dry-run',
    body: 'The manifest records the template baseline. Vitex compares it with your files and the current template. Local conflicts block even a dry run; a clean preview writes nothing.',
    steps: [
      'Read the manifest and compare SHA-256 hashes',
      'Plan additions, changes, removals, and package merges',
      'Report the plan without writes or installation'
    ]
  },
  {
    label: 'Apply',
    command: 'vitex update',
    body: 'After confirmation, Vitex backs up existing targets and applies the plan as a file transaction. A write failure restores the source files. Use --yes to skip confirmation.',
    steps: [
      'Confirm the proposed update',
      'Back up existing targets before writing',
      'Apply the plan and refresh the manifest'
    ]
  },
  {
    label: 'Resolve conflicts',
    command: 'vitex update --force --install',
    body: '--force allows replacement of modified managed files, with backups. Unsafe paths and directory collisions still block. --install runs npm after the source update; an install failure preserves that update and restores the previous lockfile.',
    steps: [
      'Allow explicit replacement of conflicting managed files',
      'Back up targets and apply the source transaction',
      'Run the requested dependency installation'
    ]
  }
] as const;

type Settings = ReturnType<typeof loader>;

/** The command builder: a form that keeps its settings in the URL. */
export const CommandStudio = ({
  project: initial,
  yes,
  git,
  github,
  install,
  invalidName
}: Settings) => {
  const [project, setProject] = useState(initial);
  const [options, setOptions] = useState({ yes, git, github, install });
  const withGit = options.git || options.github;
  const [copyStatus, setCopyStatus] = useState('');
  const { reduced } = useMotionPreference();
  const navigation = useNavigation();
  const islandXRay = useIslandXRay('builds your create command');
  const name = project.trim();
  const valid = SIMPLE_NAME.test(name);
  const command = [
    'vitex create',
    valid ? name : '<project-name>',
    ...OPTIONS.filter(
      (option) =>
        options[option.key] && !(option.key === 'git' && options.github)
    ).map((option) => option.flag)
  ].join(' ');
  const steps = [
    ...(options.github
      ? [
          {
            id: 'preflight',
            label: 'Check GitHub before creating files',
            file: 'Git + authenticated gh + available repository name',
            enabled: true,
            ask: false
          }
        ]
      : []),
    {
      id: 'template',
      label: 'Copy the Vitex template',
      file: 'app/ + server.js + vite.config.ts',
      enabled: true
    },
    {
      id: 'metadata',
      label: 'Make the project yours',
      file: 'package.json + README + LICENSE + env files',
      enabled: true
    },
    {
      id: 'manifest',
      label: 'Record template fingerprints',
      file: '.vitex-manifest.json',
      enabled: true
    },
    {
      id: 'install',
      label: 'Install dependencies',
      file: 'npm install',
      enabled: options.install,
      ask: !options.yes && !options.install
    },
    {
      id: 'git',
      label: 'Create the first commit',
      file: 'git init → add → commit',
      enabled: withGit,
      ask: !options.yes && !withGit
    },
    ...(options.github
      ? [
          {
            id: 'github',
            label: 'Create a private repository and push',
            file:
              'gh repo create <you>/' +
              (valid ? name : '<project-name>') +
              ' --private --source . --remote origin --push',
            enabled: true,
            ask: false
          }
        ]
      : [])
  ];
  const setOption = (key: keyof typeof options, checked: boolean) => {
    setOptions({ ...options, [key]: checked });
    setCopyStatus('');
  };

  return (
    <div className={styles.studio} {...islandXRay}>
      <Form method="get" preventScrollReset className={styles.configure}>
        <input type="hidden" name="configured" value="1" />
        <p className={styles.kicker}>
          <b>01</b> / Make it yours
        </p>
        <label className={styles.nameLabel} htmlFor="project-name">
          Project directory
        </label>
        <input
          id="project-name"
          className={styles.nameInput}
          name="name"
          value={project}
          onChange={(event) => {
            setProject(event.target.value);
            setCopyStatus('');
          }}
          pattern="[a-z0-9][a-z0-9\-]{0,63}"
          maxLength={64}
          required
          spellCheck={false}
          autoComplete="off"
          aria-describedby="project-name-help"
        />
        <p id="project-name-help" className={styles.help}>
          1–64 lowercase letters, numbers, or hyphens. Start with a letter or
          number. The CLI also checks npm naming rules and existing paths.
        </p>
        {invalidName && (
          <p className={styles.help}>
            The URL contained an unsupported demo name. Showing my-app.
          </p>
        )}
        <fieldset className={styles.options}>
          <legend>Choose your setup</legend>
          {OPTIONS.map((option) => (
            <label key={option.key} className={styles.option}>
              <input
                type="checkbox"
                name={option.key}
                checked={option.key === 'git' ? withGit : options[option.key]}
                disabled={option.key === 'git' && options.github}
                onChange={(event) =>
                  setOption(option.key, event.target.checked)
                }
              />
              <span>
                <strong>{option.title}</strong>
                <small>
                  {option.key === 'git' && options.github
                    ? 'Included by --github. Your initial commit is pushed to origin.'
                    : option.detail}
                </small>
              </span>
              <span
                className={styles.switch}
                aria-hidden="true"
                data-on={option.key === 'git' ? withGit : options[option.key]}>
                <motion.i
                  animate={{
                    x: (option.key === 'git' ? withGit : options[option.key])
                      ? 18
                      : 0
                  }}
                  transition={{ duration: reduced ? 0 : 0.18 }}
                />
              </span>
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          className={styles.save}
          disabled={!valid || navigation.state !== 'idle'}>
          {navigation.state === 'idle'
            ? 'Save this configuration in the URL ↗'
            : 'Saving configuration…'}
        </button>
        <p className={styles.help}>
          Command preview only. Run it in your terminal to create the project.
        </p>
      </Form>

      <section className={styles.blueprint} aria-label="Project preview">
        <div className={styles.previewHeader}>
          <span className={styles.kicker}>
            <b>02</b> / Your project takes shape
          </span>
          <span>templates/vitex</span>
        </div>
        <div className={styles.projectRoot}>
          <motion.span
            className={styles.folder}
            animate={{ rotate: withGit ? -5 : 0 }}
            aria-hidden="true">
            <svg viewBox="0 0 48 40" fill="none" aria-hidden="true">
              <path
                d="M3 8a4 4 0 0 1 4-4h11l5 6h18a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"
                fill="currentColor"
              />
              <path className={styles.folderLine} d="M4 14h40" />
            </svg>
          </motion.span>
          <div>
            <strong>{name || 'my-app'}/</strong>
            <span>
              {options.yes
                ? 'Non-interactive setup'
                : 'Interactive setup prompts'}
            </span>
          </div>
        </div>
        <ol role="list" className={styles.plan}>
          {steps.map((step, index) => (
            <motion.li
              key={step.id}
              layout
              data-enabled={step.enabled || step.ask}
              data-state={step.enabled ? 'on' : step.ask ? 'ask' : 'off'}
              transition={{ duration: reduced ? 0 : 0.25 }}>
              <motion.span
                className={styles.check}
                initial={false}
                animate={{ scale: step.enabled ? 1 : 0.85 }}
                aria-hidden="true">
                {step.enabled ? '✓' : step.ask ? '?' : '–'}
              </motion.span>
              <div>
                <strong>{step.label}</strong>
                <code>{step.file}</code>
              </div>
              <span className={styles.stepState}>
                {step.enabled ? `0${index + 1}` : step.ask ? 'ask' : 'off'}
              </span>
            </motion.li>
          ))}
        </ol>
        {options.github && (
          <motion.p
            className={styles.help}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>
            Authenticate with <code>gh auth login</code> first. GitHub setup
            runs after the local commit; a failed push preserves your project.
            Dependency installation stays a separate choice.
          </motion.p>
        )}
        {!options.yes && (
          <p className={styles.help}>
            The CLI asks for package details and any unselected Git or install
            step. GitHub creation requires the explicit --github flag.
          </p>
        )}
        <div className={styles.command}>
          <div>
            <span>$</span>
            <code>{command}</code>
          </div>
          <button
            type="button"
            disabled={!valid}
            aria-label="Copy create command"
            onClick={async () => {
              try {
                await copyToClipboard(command);
                setCopyStatus('Copied');
              } catch {
                setCopyStatus('Select the command to copy it.');
              }
            }}>
            Copy ↗
          </button>
        </div>
        <div className={styles.nextStep} aria-live="polite">
          <span className={styles.copyStatus}>
            {copyStatus || 'Then, start building'}
          </span>
          <code>
            cd {valid ? name : '<project-name>'}
            {options.install ? '' : ' && npm install'} && npm run dev
          </code>
        </div>
      </section>
    </div>
  );
};

/** The update explorer: three ways to bring a project up to date. */
export const UpdatePlans = () => {
  const [updateMode, setUpdateMode] = useState(0);
  const update = UPDATE_PLANS[updateMode] ?? UPDATE_PLANS[0];
  const { reduced } = useMotionPreference();
  const islandXRay = useIslandXRay('three ways to run an update');

  return (
    <details className={styles.update} {...islandXRay}>
      <summary>
        <span>And when the template evolves?</span>
        <span>
          Explore updates <span aria-hidden="true">+</span>
        </span>
      </summary>
      <div className={styles.updateBody}>
        <div>
          <fieldset
            className={styles.updateModes}
            aria-label="Explore template updates">
            {UPDATE_PLANS.map((plan, index) => (
              <button
                type="button"
                key={plan.label}
                aria-pressed={updateMode === index}
                onClick={() => setUpdateMode(index)}>
                {plan.label}
              </button>
            ))}
          </fieldset>
          <p>{update.body}</p>
        </div>
        <motion.div
          key={updateMode}
          className={styles.updatePlan}
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          aria-live="polite">
          <code>{update.command}</code>
          <ol role="list">
            {update.steps.map((step, index) => (
              <li key={step}>
                <span className={styles.updateStepNumber}>0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <p>Workflow illustration. No project files are changed here.</p>
        </motion.div>
      </div>
    </details>
  );
};
