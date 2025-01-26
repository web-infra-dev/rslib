import { pluginStylus } from '@rsbuild/plugin-stylus';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: ['../__fixtures__/src/index.js'],
    },
  },
  plugins: [pluginStylus()],
  output: {
    target: 'web',
  },
});
