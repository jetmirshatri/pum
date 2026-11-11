import 'server-only';

type LogLevel = 'info' | 'warn' | 'error';

export const log = (level: LogLevel, message: string, meta?: unknown): void => {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [${level}] ${message}`, meta ?? '');
};
