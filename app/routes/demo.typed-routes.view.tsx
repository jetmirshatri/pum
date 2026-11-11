'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { useIslandXRay } from '@/components/XRay/useIslandXRay';
import { SPRING_STANDARD } from '@/utils/motion';

import * as styles from './demo.typed-routes.module.css';

import type { MetaFunction } from 'react-router';

import type { loader } from './demo.typed-routes';

type LoaderData = ReturnType<typeof loader>;

export const meta: MetaFunction = ({ loaderData }) => {
  const result = loaderData as LoaderData | undefined;
  return [
    { title: result ? `${result.module.name} | Vitex` : 'Typed route | Vitex' }
  ];
};

/** The loader's answer, turning to the next module when the id changes. */
export const ModuleInspector = ({ id, module: stackModule }: LoaderData) => {
  const prefersReduced = useReducedMotion();
  const islandXRay = useIslandXRay('turns to the next module');

  const inspectorInitial = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, rotateY: -14, x: 24 };
  const inspectorExit = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, rotateY: 14, x: -24 };

  return (
    <div className={styles.inspectorWrap} {...islandXRay}>
      <AnimatePresence mode="wait">
        <motion.article
          key={id}
          className={styles.inspector}
          initial={inspectorInitial}
          animate={{ opacity: 1, rotateY: 0, x: 0 }}
          exit={inspectorExit}
          transition={SPRING_STANDARD}>
          <div className={styles.inspectorBar}>
            <span>loader://demo.typed-routes</span>
            <span>200 OK</span>
          </div>
          <div className={styles.routeLine}>
            <span>GET</span>
            <code>/demo/routes/{id}</code>
          </div>
          <div className={styles.payload}>
            <p>
              <span>{'{'}</span>
            </p>
            <p>
              &nbsp;&nbsp;<i>"id"</i>: <b>"{id}"</b>,
            </p>
            <p>
              &nbsp;&nbsp;<i>"module"</i>: <span>{'{'}</span>
            </p>
            <p>
              &nbsp;&nbsp;&nbsp;&nbsp;<i>"name"</i>: <b>"{stackModule.name}"</b>
              ,
            </p>
            <p>
              &nbsp;&nbsp;&nbsp;&nbsp;<i>"role"</i>: <b>"{stackModule.role}"</b>
              ,
            </p>
            <p>
              &nbsp;&nbsp;&nbsp;&nbsp;<i>"file"</i>: <b>"{stackModule.file}"</b>
            </p>
            <p>&nbsp;&nbsp;{'}'}</p>
            <p>{'}'}</p>
          </div>
          <div className={styles.moduleSummary}>
            <span>{stackModule.role}</span>
            <h2>{stackModule.name}</h2>
            <p>{stackModule.description}</p>
            <code>{stackModule.file}</code>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
};
