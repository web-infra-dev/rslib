import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      bundle: false,
    }),
    generateBundleEsmConfig({
      bundle: false,
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
