import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      bundle: false,
      dts: {
        autoExtension: true,
        distPath: './dist/types',
        bundle: false,
      },
    }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/src/**'],
    },
  },
});
