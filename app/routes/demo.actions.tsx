import { data } from 'react-router';

import { DemoPage } from '@/components/DemoPage/DemoPage';
import { xray } from '@/components/XRay/xray';

import * as styles from './demo.actions.module.css';
import { OptimisticCounter } from './demo.actions.view';

import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

// Demo only: shared by requests on this worker, and reset on server restart.
// Use a session or database for persistent application state.
let count = 0;

export const loader = (_args: LoaderFunctionArgs) => ({ count });

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const requested = Number(form.get('delay') ?? 800);
  const delay = [0, 800, 2000].includes(requested) ? requested : 800;
  await new Promise((resolve) => setTimeout(resolve, delay));
  if (form.get('fail') === 'on') {
    return data(
      { count, error: 'Demo rejection: the server kept its value.' },
      { status: 422 }
    );
  }
  count += 1;
  return data({ count, error: null });
};

export { meta } from './demo.actions.view';

// The page is a Server Component; the experiment is a client island.
export default function ActionsRoute() {
  return (
    <DemoPage
      eyebrow="React Router / optimistic state"
      title="Feels instant. Stays in sync."
      description="Click once. The browser responds immediately, then the server has its say. Slow it down to see the handoff, or reject a request to see it roll back."
      previous={{ to: '/demo/streaming', label: 'Back to runtime' }}
      next={{ to: '/demo/routes/1', label: 'Inspect typed routes' }}>
      <OptimisticCounter />
      <div
        className={styles.note}
        {...xray('server', 'its code stays on the server')}>
        <span aria-hidden="true">↳</span>
        <p>
          This demo uses a shared, temporary server counter that resets on
          restart. Your application can use the same interaction with a session
          or database.
        </p>
      </div>
    </DemoPage>
  );
}
