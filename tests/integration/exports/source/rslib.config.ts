import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    // The web target concatenates the imported module into the CJS entry.
    target: 'web',
  },
});
