import { resolve } from 'node:path';
import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: resolve(__dirname, 'dist/esm'),
        },
      },
    }),
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: resolve(__dirname, 'dist/cjs'),
        },
      },
    }),
  ],
  root: resolve(__dirname, '../__fixtures__/basic'),
  source: {
    entry: {
      index: ['./src/index.less'],
    },
  },
  resolve: {
    alias: {
      '~': require('node:path').resolve(
        __dirname,
        '../__fixtures__/basic/src/nest',
      ),
    },
  },
  output: {
    target: 'web',
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
});
