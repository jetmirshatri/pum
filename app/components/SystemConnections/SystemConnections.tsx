'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import { useIslandXRay } from '@/components/XRay/useIslandXRay';
import { useMotionPreference } from '@/hooks/useShowcaseMotion';

import { CONNECTIONS } from './connections';
import * as styles from './systemconnections.module.css';

const POSITIONS = [
  { x: 96, y: 105 },
  { x: 300, y: 105 },
  { x: 504, y: 105 },
  { x: 504, y: 275 },
  { x: 300, y: 275 },
  { x: 96, y: 275 }
];

const connectionPath = (from: number, to: number) => {
  const a = POSITIONS[from];
  const b = POSITIONS[to];
  if (!a || !b) return '';
  if (a.y === b.y || a.x === b.x) return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  return `M${a.x} ${a.y} V190 H${b.x} V${b.y}`;
};

export const SystemConnections = () => {
  const [sceneIndex, setSceneIndex] = useState(1);
  const [selected, setSelected] = useState(0);
  const { reduced } = useMotionPreference();
  const islandXRay = useIslandXRay('opens one connection at a time');
  const scene = CONNECTIONS[sceneIndex] ?? CONNECTIONS[0];
  if (!scene) return null;
  const node = scene.nodes[selected] ?? scene.nodes[0];
  if (!node) return null;

  return (
    <section
      id="application-connections"
      className={styles.section}
      aria-labelledby="connections-title"
      {...islandXRay}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Open the hood</p>
        <h2 id="connections-title">The details make the difference.</h2>
        <p>
          Follow the CLI, providers, styles, checks, and delivery paths that
          make this application work.
        </p>
      </div>
      <div className={styles.figure}>
        <fieldset
          className={styles.scenes}
          aria-label="Explore application systems">
          {CONNECTIONS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={sceneIndex === index}
              onClick={() => {
                setSceneIndex(index);
                setSelected(0);
              }}>
              <span>0{index + 1}</span>
              {item.label}
              {sceneIndex === index && (
                <motion.i
                  className={styles.underline}
                  layoutId="connection-scene"
                  transition={{ duration: reduced ? 0 : 0.2 }}
                />
              )}
            </button>
          ))}
        </fieldset>
        <div className={styles.workspace}>
          <div className={styles.diagram}>
            <div className={styles.diagramHeading}>
              <span className={styles.mapLabel}>
                {scene.label.toUpperCase()} / CONNECTION MAP
              </span>
              <p>{scene.summary}</p>
            </div>
            <div className={styles.board}>
              <svg
                viewBox="0 0 600 380"
                preserveAspectRatio="none"
                className={styles.wires}
                aria-hidden="true">
                {scene.edges.map(([from, to]) => {
                  const d = connectionPath(from, to);
                  return (
                    <g key={`${scene.id}-${from}-${to}`}>
                      <path d={d} className={styles.track} />
                      {(selected === from || selected === to) && (
                        <motion.path
                          key={selected}
                          d={d}
                          className={styles.signal}
                          initial={{ pathLength: reduced ? 1 : 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{
                            duration: reduced ? 0 : 0.65,
                            ease: 'easeOut'
                          }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
              {scene.nodes.map((item, index) => {
                const point = POSITIONS[index];
                if (!point) return null;
                return (
                  <div
                    className={styles.nodePosition}
                    key={`${scene.id}-${item.label}`}
                    style={{
                      left: `${point.x / 6}%`,
                      top: `${point.y / 3.8}%`
                    }}>
                    <motion.button
                      type="button"
                      className={styles.node}
                      aria-pressed={selected === index}
                      onClick={() => setSelected(index)}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        y: selected === index && !reduced ? -5 : 0
                      }}
                      transition={{ duration: reduced ? 0 : 0.2 }}>
                      <span className={styles.nodeNumber}>0{index + 1}</span>
                      <strong>{item.label}</strong>
                      <small>{item.tag}</small>
                    </motion.button>
                  </div>
                );
              })}
            </div>
            <p className={styles.caption}>{scene.caption}</p>
          </div>
          <div
            className={styles.inspector}
            aria-live="polite"
            aria-atomic="true">
            <div className={styles.inspectorBar}>
              <span>INSPECT / 0{selected + 1}</span>
              <span>{node.tag}</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${scene.id}-${selected}`}
                initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.14 }}>
                <h3>{node.title}</h3>
                <p className={styles.description}>{node.body}</p>
                <ol role="list" className={styles.trace}>
                  {node.trace.map((line, index) => (
                    <motion.li
                      key={line}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: reduced ? 0 : index * 0.07 }}>
                      <span>0{index + 1}</span>
                      <code>{line}</code>
                    </motion.li>
                  ))}
                </ol>
                <div className={styles.source}>
                  <span>In the source</span>
                  <code>{node.file}</code>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
