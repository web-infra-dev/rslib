import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      source: {
        define: {
          VERSION: JSON.stringify('1.0.0'),
        },
      },
      output: {
        distPath: {
          root: './dist/esm/0',
        },
      },
    }),
    generateBundleEsmConfig({
      source: {
        define: {
          VERSION: JSON.stringify('1.0.0'),
          'process.env.NODE_ENV': 'process.ENV.MY_CUSTOM_ENV',
        },
      },
      output: {
        distPath: {
          root: './dist/esm/1',
        },
      },
    }),
    generateBundleCjsConfig({
      source: {
        define: {
          VERSION: JSON.stringify('1.0.0'),
        },
      },
      output: {
        distPath: {
          root: './dist/cjs/0',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
