import { resolve } from 'node:path';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: resolve(__dirname, 'dist/esm'),
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: resolve(__dirname, 'dist/cjs'),
        },
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**/*.scss', './foundation/logo.svg'],
    },
  },
  root: resolve(__dirname, '../__fixtures__'),
  plugins: [
    pluginSass({
      sassLoaderOptions: {
        additionalData: '$base-color: #c6538c;',
      },
    }),
  ],
  output: {
    target: 'web',
    assetPrefix: 'auto',
  },
});
