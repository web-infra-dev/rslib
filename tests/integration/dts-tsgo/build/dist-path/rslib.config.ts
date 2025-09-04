import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        bundle: false,
        build: true,
        distPath: './dist/custom',
        experiments: {
          tsgo: true,
        },
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
