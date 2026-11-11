import { defineConfig } from 'vitest/config';

// Unit tests for app code: app/**/*.test.ts(x). npm test runs them before the
// runtime checks in scripts/, which test the built production server.
export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  css: {
    modules: {
      localsConvention: 'dashes'
    }
  },
  test: {
    include: ['app/**/*.test.{ts,tsx}']
  }
});
