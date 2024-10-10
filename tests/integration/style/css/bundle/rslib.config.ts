import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: '../__fixtures__/basic/src/import.css',
    },
  },
});
