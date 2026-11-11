import { Link } from 'react-router';

import { VitexLogo } from '@/components/VitexLogo/VitexLogo';
import { FOOTER_GROUPS } from '@/config/navigation';
import { site } from '@/config/site';

import * as styles from './sitefooter.module.css';

export const SiteFooter = () => (
  <footer className={styles.shell}>
    <div className={styles.footer}>
      <div className={styles.pitch}>
        <Link to="/" className={styles.brand}>
          <VitexLogo className={styles.brandLogo} />
        </Link>
        {site.description && <p>{site.description}</p>}
      </div>

      {(FOOTER_GROUPS.length > 0 || site.repository) && (
        <div className={styles.links}>
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <p>{group.title}</p>
              {group.links.map(({ to, label, reloadDocument }) => (
                <Link key={to} to={to} reloadDocument={reloadDocument}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
          {site.repository && (
            <div>
              <p>Source</p>
              <a href={site.repository} rel="noreferrer" target="_blank">
                Repository ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  </footer>
);
