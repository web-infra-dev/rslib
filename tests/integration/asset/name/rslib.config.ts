import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle',
        },
        filename: {
          image: '[name].[contenthash:8][ext]',
        },
      },
    }),
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless',
        },
        filename: {
          image: '[name].[contenthash:16][ext]',
        },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.jsx',
    },
  },
  plugins: [pluginReact()],
});
