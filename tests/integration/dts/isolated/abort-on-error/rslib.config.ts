import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        isolated: true,
        abortOnError: false,
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
