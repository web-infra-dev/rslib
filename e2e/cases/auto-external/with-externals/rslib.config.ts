import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [generateBundleEsmConfig(__dirname), generateBundleCjsConfig(__dirname)],
  output: {
    externals: {
      react: 'react1',
    },
  },
  source: {
    entry: {
      main: '../fixtures/src/index.ts',
    },
  },
});
