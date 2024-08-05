import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, {
      autoExtension: true,
    }),
    generateBundleCjsConfig(__dirname, {
      autoExtension: true,
    }),
  ],
  source: {
    entry: {
      main: './src/index.ts',
    },
  },
});
