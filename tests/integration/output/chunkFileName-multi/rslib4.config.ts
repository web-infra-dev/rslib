import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      source: {
        entry: {
          runtime1: './src/runtime1.js',
        },
      },
    }),
    generateBundleEsmConfig({
      source: {
        entry: {
          runtime2: './src/runtime2.js',
        },
      },
    }),
    generateBundleEsmConfig({
      source: {
        entry: {
          multi1: './src/runtime1.js',
          multi2: './src/runtime2.js',
        },
      },
      output: {
        filename: {
          js: 'custom/[name].js',
        },
      },
    }),
    generateBundleEsmConfig({
      source: {
        entry: {
          manual: './src/runtime1.js',
        },
      },
      tools: {
        rspack: {
          optimization: {
            runtimeChunk: {
              name: 'manual-runtime',
            },
          },
        },
      },
    }),
  ],
});
