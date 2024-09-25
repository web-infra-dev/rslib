import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  output: {
    target: 'node',
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
