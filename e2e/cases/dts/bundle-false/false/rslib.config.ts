import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: false,
    }),
    generateBundleCjsConfig({
      bundle: false,
    }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/src/**'],
    },
  },
});
