import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

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
