import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        distPath: {
          root: 'dist/bundle/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        distPath: {
          root: 'dist/bundle/cjs',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: './src/**',
        },
      },
      output: {
        distPath: {
          root: 'dist/bundleless/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      source: {
        entry: {
          index: './src/**',
        },
      },
      output: {
        distPath: {
          root: 'dist/bundleless/cjs',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@src': 'src',
    },
  },
});
