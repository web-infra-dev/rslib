import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  output: {
    externals: {
      react: 'react1',
    },
  },
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
  },
});
