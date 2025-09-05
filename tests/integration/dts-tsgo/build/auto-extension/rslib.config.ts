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
        build: true,
        tsgo: true,
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
