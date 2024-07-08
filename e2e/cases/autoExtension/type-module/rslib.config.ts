import { join } from 'node:path';
import { defineConfig } from '@rslib/core';
import {
  generateBundleCjsConfig,
  generateBundleEsmConfig,
} from '../../../scripts/shared';

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
      main: join(__dirname, 'src/index.ts'),
    },
  },
});
