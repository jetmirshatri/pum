'use client';

import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import {
  isRouteErrorResponse,
  Link,
  useLocation,
  useNavigate,
  useRouteError
} from 'react-router';

import { RouteError } from '@/components/RouteError/RouteError';

import * as styles from './errorboundary.module.css';

import type { FC } from 'react';

// app/routes/$.tsx takes the 404 page's title from here.
export { meta } from '@/components/RouteError/RouteError';

const isProduction = process.env.NODE_ENV === 'production';

const extractMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'An unexpected error occurred';
};

const toDisplayMessage = (error: unknown): string =>
  isProduction
    ? 'An error occurred while rendering this page.'
    : extractMessage(error);

type ErrorScreenProps = {
  status?: number;
  statusText: string;
  message: string;
  requestPath: string;
  onRetry: () => void;
};

const ErrorScreen: FC<ErrorScreenProps> = ({
  status,
  statusText,
  message,
  requestPath,
  onRetry
}) => {
  const prefersReduced = useReducedMotion();
  const isNotFound = status === 404;
  const isResponseError = status !== undefined;
  const code = status ? `${status}` : 'ERR';
  const heading = isNotFound
    ? 'No route matched this request.'
    : isResponseError
      ? 'The request stopped at the boundary.'
      : 'The render stopped safely.';
  const description = isNotFound
    ? 'The typed route tree returned no match. The application shell kept running and is ready to recover.'
    : 'The failure was isolated, so you can recover without losing the rest of the application.';

  return (
    <MotionConfig reducedMotion="user">
      <section role="alert" aria-live="assertive" className={styles.page}>
        <motion.article
          className={styles.panel}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}>
          <div className={styles.consoleBar}>
            <code>app://error-boundary</code>
            <span>{status ? `HTTP ${status}` : 'RUNTIME'}</span>
          </div>

          <div className={styles.content}>
            <div className={styles.copy}>
              <p className={styles.eyebrow}>
                {isNotFound ? 'Route resolution' : 'Protected runtime'}
              </p>
              <div className={styles.statusLine}>
                <p className={styles.status} aria-hidden="true">
                  {code}
                </p>
                <span>
                  <i aria-hidden="true" />
                  {statusText}
                </span>
              </div>
              <h1>{heading}</h1>
              <p className={styles.description}>{description}</p>

              <div className={styles.actions}>
                <Link className={styles.primaryAction} to="/">
                  Return home <span aria-hidden="true">→</span>
                </Link>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={onRetry}>
                  Retry request
                </button>
              </div>
            </div>

            <div className={styles.inspector}>
              <div className={styles.flow} aria-hidden="true">
                <span>request</span>
                <div>
                  <motion.i
                    animate={
                      prefersReduced
                        ? undefined
                        : {
                            left: ['0%', 'calc(100% - 0.5rem)'],
                            opacity: [0, 1, 1, 0]
                          }
                    }
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                </div>
                <span>{isNotFound ? '404' : 'boundary'}</span>
              </div>

              <div className={styles.trace}>
                <div className={styles.traceHeader}>
                  <span>route.trace</span>
                  <span>3 events</span>
                </div>
                <div className={styles.traceBody}>
                  <p>
                    <span>01</span>
                    <code>GET {requestPath}</code>
                    <b>received</b>
                  </p>
                  <p>
                    <span>02</span>
                    <code>
                      {isResponseError ? 'route.match()' : 'render.tree()'}
                    </code>
                    <b className={styles.failed}>
                      {isNotFound ? 'no match' : 'stopped'}
                    </b>
                  </p>
                  <p>
                    <span>03</span>
                    <code>boundary.render()</code>
                    <b className={styles.recovered}>recovered</b>
                  </p>
                </div>
                {isResponseError ? null : (
                  <pre className={styles.message}>{message}</pre>
                )}
              </div>
            </div>
          </div>

          <div className={styles.consoleFooter}>
            <code>
              <span>$</span>{' '}
              {isNotFound
                ? `resolveRoute('${requestPath}')`
                : 'boundary.recover()'}
            </code>
            <span>application shell remains available</span>
          </div>
        </motion.article>
      </section>
    </MotionConfig>
  );
};

const ErrorBoundary: FC = () => {
  const error = useRouteError();
  const location = useLocation();
  const navigate = useNavigate();
  const requestPath = `${location.pathname}${location.search}`;

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <RouteError />;
  }

  if (isRouteErrorResponse(error)) {
    const statusText =
      error.statusText ||
      (error.status === 404 ? 'Not Found' : 'Request failed');

    return (
      <ErrorScreen
        status={error.status}
        statusText={statusText}
        message={statusText}
        requestPath={requestPath}
        onRetry={() => navigate(0)}
      />
    );
  }

  return (
    <ErrorScreen
      statusText="Render exception"
      message={toDisplayMessage(error)}
      requestPath={requestPath}
      onRetry={() => navigate(0)}
    />
  );
};

export default ErrorBoundary;
