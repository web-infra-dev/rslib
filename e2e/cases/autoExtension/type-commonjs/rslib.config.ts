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
      main: './src/index.ts',
    },
  },
});
