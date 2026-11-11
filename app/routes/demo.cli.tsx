import { DemoPage } from '@/components/DemoPage/DemoPage';

import { CommandStudio, UpdatePlans } from './demo.cli.view';

import type { LoaderFunctionArgs } from 'react-router';

export { meta } from './demo.cli.view';

const SIMPLE_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

export const loader = ({ request }: LoaderFunctionArgs) => {
  const query = new URL(request.url).searchParams;
  const name = query.get('name')?.trim() || 'my-app';
  return {
    project: SIMPLE_NAME.test(name) ? name : 'my-app',
    yes: !query.has('configured') || query.get('yes') === 'on',
    git: query.get('git') === 'on',
    github: query.get('github') === 'on',
    install: query.get('install') === 'on',
    invalidName: !SIMPLE_NAME.test(name)
  };
};

// The page is a Server Component; the command builder and the update
// explorer are client islands inside it.
export default function CliRoute({
  loaderData
}: {
  loaderData: ReturnType<typeof loader>;
}) {
  return (
    <DemoPage
      eyebrow="Vitex CLI / create"
      title="Your project starts here."
      description="Choose what happens after the first command. Watch the template become your application, one deliberate step at a time."
      previous={{ to: '/demo/architecture', label: 'Back to architecture' }}
      next={{ to: '/demo/streaming', label: 'Continue to runtime' }}>
      <CommandStudio key={JSON.stringify(loaderData)} {...loaderData} />
      <UpdatePlans />
    </DemoPage>
  );
}
