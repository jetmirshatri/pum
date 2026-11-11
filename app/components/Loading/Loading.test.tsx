import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Loading } from '@/components/Loading/Loading';

describe('Loading', () => {
  it('announces loading to assistive technology', () => {
    const html = renderToString(<Loading />);
    expect(html).toContain('role="status"');
    expect(html).toContain('Loading…');
  });
});
