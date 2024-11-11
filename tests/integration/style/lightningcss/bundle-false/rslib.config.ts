import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({ bundle: false }),
    generateBundleCjsConfig({ bundle: false }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/basic/src/*.css'],
    },
  },
  output: {
    target: 'web',
  },
});
