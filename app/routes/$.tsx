import type { LoaderFunctionArgs } from 'react-router';

export const loader = (_args: LoaderFunctionArgs) => {
  throw new Response('Not Found', { status: 404 });
};

export default function NotFoundRoute() {
  return null;
}

export {
  default as ErrorBoundary,
  meta
} from '@/components/ErrorBoundary/ErrorBoundary';
