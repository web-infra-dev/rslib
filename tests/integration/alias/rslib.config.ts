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
        distPath: 'dist/bundle/esm',
      },
    }),
    generateBundleCjsConfig({
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        distPath: 'dist/bundle/cjs',
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
        distPath: 'dist/bundleless/esm',
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
        distPath: 'dist/bundleless/cjs',
      },
    }),
  ],
  resolve: {
    alias: {
      '@src': 'src',
    },
  },
});
