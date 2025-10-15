import { type BabelTransformOptions, pluginBabel } from '@rsbuild/plugin-babel';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

const polyfillPlugin = (targets: BabelTransformOptions['targets']) =>
  pluginBabel({
    babelLoaderOptions: {
      plugins: [
        [
          require('babel-plugin-polyfill-corejs3'),
          {
            method: 'usage-pure',
            targets: targets,
            version: '3.29',
          },
        ],
      ],
    },
  });

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: 'dist/esm0',
      },
      plugins: [
        polyfillPlugin({
          ie: '10',
        }),
      ],
    }),
    generateBundleCjsConfig({
      output: {
        distPath: 'dist/cjs0',
      },
      plugins: [
        polyfillPlugin({
          ie: '10',
        }),
      ],
    }),
    generateBundleEsmConfig({
      output: {
        distPath: 'dist/esm1',
      },
      plugins: [
        polyfillPlugin({
          chrome: '123',
        }),
      ],
    }),
  ],
});
