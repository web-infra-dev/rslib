import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [generateBundleEsmConfig(__dirname), generateBundleCjsConfig(__dirname)],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    externals: { react: 'react' },
  },
});
