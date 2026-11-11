import type { LoaderFunctionArgs } from 'react-router';

export const loader = (_args: LoaderFunctionArgs) =>
  Response.json(
    {
      status: 'ok',
      time: Date.now(),
      uptime: process.uptime()
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    }
  );
