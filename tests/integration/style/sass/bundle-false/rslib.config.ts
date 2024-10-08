import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({ bundle: false }),
    generateBundleCjsConfig({ bundle: false }),
  ],
  source: {
    entry: {
      index: [
        '../__fixtures__/src/**/*.scss',
        // TODO: assets support
        // '../__fixtures__/foundation/logo.svg'
      ],
    },
  },
  plugins: [
    pluginSass({
      sassLoaderOptions: {
        additionalData: '$base-color: #c6538c;',
      },
    }),
  ],
  // output: {
  //   dataUriLimit: {
  //     svg: 0
  //   }
  // }
});
