import { defineConfig } from '@rslib/core';
import {
  generateBundleCjsConfig,
  generateBundleEsmConfig,
} from '../../../scripts/shared';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, {
      dts: {
        bundle: true,
      },
    }),
    generateBundleCjsConfig(__dirname),
  ],
  source: {
    entry: {
      main: './src/index.ts',
    },
  },
});
