import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: './src/index.ts',
    },
    define: {
      VERSION: JSON.stringify('1.0.0'),
    },
  },
});
