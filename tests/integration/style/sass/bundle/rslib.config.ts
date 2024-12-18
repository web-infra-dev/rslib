import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: ['../__fixtures__/src/index.scss'],
    },
  },
  plugins: [
    pluginSass({
      sassLoaderOptions: {
        additionalData: '$base-color: #c6538c;',
      },
    }),
  ],
  output: {
    target: 'web',
    assetPrefix: 'auto', // TODO: move this line to packages/core/src/asset/assetConfig.ts
  },
});
