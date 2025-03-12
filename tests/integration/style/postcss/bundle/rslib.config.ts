import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: ['../__fixtures__/basic/src/index.css'],
    },
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [require('postcss-alias')],
      },
    },
  },
  output: {
    target: 'web',
  },
});
