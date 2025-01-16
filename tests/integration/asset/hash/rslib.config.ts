import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. bundle default
    // esm
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
    // cjs
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs/bundle',
        },
        filename: {
          image: '[name].[contenthash:8][ext]',
        },
      },
    }),
    // 1. bundleless default
    // esm
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless',
        },
        filename: {
          image: '[name].[contenthash:8][ext]',
        },
      },
    }),
    // cjs
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/cjs/bundleless',
        },
        filename: {
          image: '[name].[contenthash:8][ext]',
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginReact()],
});
