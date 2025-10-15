import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/esm',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        minify: true,
        distPath: './dist/cjs',
      },
    }),
  ],
  source: {
    entry: {
      index: './src/*',
    },
  },
  output: {
    target: 'web',
  },
});
