import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      autoExtension: false,
    }),
    generateBundleCjsConfig({
      bundle: false,
      autoExtension: false,
    }),
  ],
  source: {
    entry: {
      index: '../../__fixtures__/src',
    },
  },
});
