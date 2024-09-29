import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

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
