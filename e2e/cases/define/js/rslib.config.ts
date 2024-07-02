import { join } from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from '#shared';

export default defineConfig({
  lib: [generateBundleEsmConfig(__dirname), generateBundleCjsConfig(__dirname)],
  source: {
    entry: {
      main: join(__dirname, 'src/index.js'),
    },
    define: {
      VERSION: JSON.stringify('1.0.0'),
    },
  },
});
