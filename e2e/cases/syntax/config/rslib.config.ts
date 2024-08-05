import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, {
      output: {
        syntax: 'es2015',
      },
    }),
    generateBundleCjsConfig(__dirname, {
      output: {
        syntax: ['node 20'],
      },
    }),
  ],
  source: {
    entry: {
      main: './src/index.ts',
    },
  },
});
