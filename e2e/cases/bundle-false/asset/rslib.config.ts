import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
    }),
    generateBundleCjsConfig({
      bundle: false,
    }),
  ],
  // do not inline svg
  output: {
    dataUriLimit: {
      svg: 0,
    },
  },
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
