import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      id: 'esm-basic',
      bundle: false,
      output: {
        distPath: './dist/esm-basic',
        externals: {
          foo: false,
        },
      },
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
    }),
    generateBundleCjsConfig({
      id: 'cjs-basic',
      bundle: false,
      output: {
        distPath: './dist/cjs-basic',
        externals: {
          foo: false,
        },
      },
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
    }),
    generateBundleEsmConfig({
      id: 'esm-shared',
      bundle: false,
      output: {
        distPath: './dist/esm-shared',
        externals: {
          foo: false,
        },
      },
      source: {
        entry: {
          index: ['./src/a.ts', './src/b.ts'],
        },
      },
    }),
    generateBundleCjsConfig({
      id: 'cjs-shared',
      bundle: false,
      output: {
        distPath: './dist/cjs-shared',
        externals: {
          foo: false,
        },
      },
      source: {
        entry: {
          index: ['./src/a.ts', './src/b.ts'],
        },
      },
    }),
  ],
});
