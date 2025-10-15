import { resolve } from 'node:path';
import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: resolve(__dirname, 'dist/esm'),
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: resolve(__dirname, 'dist/cjs'),
      },
    }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/basic/src/**'],
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '../__fixtures__/basic/src/nest'),
    },
  },
  plugins: [
    pluginLess({
      lessLoaderOptions: {
        lessOptions: {
          math: 'always',
        },
        additionalData: '@base-color: #c6538c;',
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
