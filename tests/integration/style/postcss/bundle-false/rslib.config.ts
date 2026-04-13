import { defineConfig } from '@rslib/core';
import { createRequire } from 'node:module';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

const require = createRequire(import.meta.url);

export default defineConfig({
  lib: [
    generateBundleEsmConfig({ bundle: false }),
    generateBundleCjsConfig({ bundle: false }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/basic/src/**/*.css'],
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
