import { NavLink } from 'react-router';

import { ThemeSwitcher } from '@/components/ThemeSwitcher/ThemeSwitcher';
import { VitexLogo } from '@/components/VitexLogo/VitexLogo';
import { XRayToggle } from '@/components/XRay/XRayToggle';
import { site } from '@/config/site';

import { HeaderNav, HeaderProgress } from './HeaderNav';
import * as styles from './siteheader.module.css';

/** The sticky header: the brand, the navigation and the two switches. */
export const SiteHeader = () => (
  <header className={styles.header}>
    <div className={styles.bar}>
      <NavLink to="/" className={styles.brand} aria-label="Vitex, home">
        <VitexLogo className={styles.brandLogo} />
      </NavLink>

      <HeaderNav />

      <div className={styles.tools}>
        {site.repository && (
          <a
            className={styles.repository}
            href={site.repository}
            rel="noreferrer"
            target="_blank">
            Source <span aria-hidden="true">↗</span>
          </a>
        )}
        <XRayToggle />
        <ThemeSwitcher />
      </div>
    </div>
    <HeaderProgress />
  </header>
);
