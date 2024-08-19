import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

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
