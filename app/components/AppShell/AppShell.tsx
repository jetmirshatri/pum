import { SiteFooter } from '@/components/SiteFooter/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader/SiteHeader';
import { StatusLine } from '@/components/StatusLine/StatusLine';
import { XRayKey } from '@/components/XRay/XRayToggle';

import type { ReactNode } from 'react';

/** The frame around every page: the demo's header and footer, the status
 * line, and the key of the X-ray layer while it is on. */
export const AppShell = ({ children }: { children: ReactNode }) => (
  <>
    <SiteHeader />
    {children}
    <SiteFooter />
    <StatusLine />
    <XRayKey />
  </>
);
