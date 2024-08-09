import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, {
      autoExtension: false,
    }),
    generateBundleCjsConfig(__dirname, {
      autoExtension: false,
    }),
  ],
  source: {
    entry: {
      main: '../../__fixtures__/src/index.ts',
    },
  },
});
