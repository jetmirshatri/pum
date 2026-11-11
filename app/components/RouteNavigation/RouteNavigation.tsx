import { MotionLink } from '@/components/Motion/Motion';
import { SPRING_SNAPPY } from '@/utils/motion';

import * as styles from './routenavigation.module.css';

type Destination = { to: string; label: string };
type Props = { previous: Destination; next: Destination };

export const RouteNavigation = ({ previous, next }: Props) => (
  <nav className={styles.navigation} aria-label="Continue exploring">
    <MotionLink
      to={previous.to}
      prefetch="intent"
      whileHover={{ x: -4 }}
      transition={SPRING_SNAPPY}>
      <span aria-hidden="true">←</span> {previous.label}
    </MotionLink>
    <MotionLink
      to={next.to}
      prefetch="intent"
      whileHover={{ x: 4 }}
      transition={SPRING_SNAPPY}>
      {next.label} <span aria-hidden="true">→</span>
    </MotionLink>
  </nav>
);
