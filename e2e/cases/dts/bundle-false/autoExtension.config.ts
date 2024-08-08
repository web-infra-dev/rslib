import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, {
      bundle: false,
    }),
    generateBundleCjsConfig(__dirname, {
      bundle: false,
      dts: {
        bundle: false,
      },
    }),
  ],
  source: {
    entry: {
      main: ['./src/**'],
    },
  },
});
