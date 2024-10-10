import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({ bundle: false }),
    generateBundleCjsConfig({ bundle: false }),
  ],
  source: {
    entry: {
      index: ['../__fixtures__/basic/src/**', '!../__fixtures__/**/*.d.ts'],
    },
    alias: {
      '~': require('node:path').resolve(
        __dirname,
        '../__fixtures__/basic/src/nest',
      ),
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
    // TODO: support asset
    // dataUriLimit: 0
  },
});
