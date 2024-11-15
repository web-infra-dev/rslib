import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        bundle: false,
        distPath: './dist-types',
      },
    }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/src/**'],
    },
  },
});
