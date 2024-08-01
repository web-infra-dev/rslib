import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from '#shared';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, {
      bundle: false,
      dts: {
        bundle: false,
      },
    }),
    generateBundleCjsConfig(__dirname, {
      bundle: false,
    }),
  ],
  source: {
    entry: {
      main: ['./src/**'],
    },
  },
});
