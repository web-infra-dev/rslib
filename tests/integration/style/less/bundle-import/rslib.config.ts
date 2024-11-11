import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: ['../__fixtures__/import/src/index.ts'],
    },
  },
  output: {
    target: 'web',
  },
  plugins: [pluginLess()],
});
