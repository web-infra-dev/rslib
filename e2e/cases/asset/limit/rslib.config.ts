import { generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/inline',
        },
      },
    }),
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/external',
        },
        dataUriLimit: {
          svg: 0,
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/inline-bundleless',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/external-bundleless',
        },
        dataUriLimit: {
          svg: 0,
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.js',
    },
  },
});
