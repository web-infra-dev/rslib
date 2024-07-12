import { join } from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from '#shared';

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
      main: join(__dirname, 'src/index.ts'),
    },
  },
});
