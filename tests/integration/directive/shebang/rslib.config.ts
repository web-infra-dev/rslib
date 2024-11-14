import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

const esmShared = {
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
};

const esmSharedBundleFalse = {
  bundle: false,
  source: {
    entry: {
      index: './src/*',
    },
  },
};

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      ...esmShared,
      shims: { esm: { __dirname: true, __filename: true } },
      output: {
        distPath: {
          root: './dist/bundle/esm0',
        },
      },
    }),
    generateBundleEsmConfig({
      ...esmShared,
      shims: { esm: { __dirname: true, __filename: true } },
      output: {
        minify: true,
        distPath: {
          root: './dist/bundle/esm1',
        },
      },
    }),
    generateBundleEsmConfig({
      ...esmSharedBundleFalse,
      shims: { esm: { __dirname: true, __filename: true } },
      output: {
        distPath: {
          root: './dist/bundle-false/esm0',
        },
      },
    }),
    generateBundleEsmConfig({
      ...esmSharedBundleFalse,
      shims: { esm: { __dirname: true, __filename: true } },
      output: {
        minify: true,
        distPath: {
          root: './dist/bundle-false/esm1',
        },
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
