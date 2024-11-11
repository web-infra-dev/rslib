import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: ['../__fixtures__/basic/src/index.less'],
    },
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
