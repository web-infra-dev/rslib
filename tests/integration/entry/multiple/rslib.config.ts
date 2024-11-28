import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: './src/index.ts',
      foo: './src/foo.ts',
      bar: './src/bar.ts',
      shared: './src/shared.ts',
    },
  },
});
