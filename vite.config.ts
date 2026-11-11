import react from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc/plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  resolve: {
    // Experimental Vite v8+ flag: path aliases are read from tsconfig.json#paths.
    tsconfigPaths: true
  },
  css: {
    modules: {
      localsConvention: 'dashes'
    }
  },
  build: {
    rolldownOptions: {
      checks: {
        pluginTimings: false
      }
    }
  },
  plugins: [
    // React Compiler runs natively through oxc-transform-react, in the client
    // environment only: RSC and SSR output renders once per request, so
    // memoization there would only add work.
    react({ compiler: true }),
    rsc({
      serverHandler: false,
      entries: {
        client: './app/entry.client.tsx',
        rsc: './app/entry.rsc.tsx',
        ssr: './app/entry.ssr.tsx'
      }
    })
  ],
  environments: {
    client: {
      build: { outDir: 'build/client' },
      optimizeDeps: {
        include: ['react-router', 'react-router/internal/react-server-client']
      },
      dev: {
        warmup: ['./app/entry.client.tsx', './app/root.client.tsx']
      }
    },
    rsc: {
      build: { outDir: 'build/rsc' },
      ...(command === 'build' && { resolve: { noExternal: true } })
    },
    ssr: {
      build: { outDir: 'build/ssr' },
      dev: {
        warmup: ['./app/entry.ssr.tsx', './app/root.client.tsx']
      },
      optimizeDeps: {
        include: ['react-dom/server.edge', 'isbot']
      },
      ...(command === 'build' && { resolve: { noExternal: true } })
    }
  }
}));
