import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from '#shared';

export default defineConfig({
  lib: [generateBundleEsmConfig(__dirname), generateBundleCjsConfig(__dirname)],
  source: {
    entry: {
      main: './src/index.ts',
    },
    define: {
      VERSION: JSON.stringify('1.0.0'),
    },
  },
});
