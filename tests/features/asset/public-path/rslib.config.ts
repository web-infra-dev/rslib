import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle',
        },
        assetPrefix: '/public/path/bundle',
        dataUriLimit: {
          svg: 0,
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless',
        },
        assetPrefix: '/public/path/bundleless',
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
