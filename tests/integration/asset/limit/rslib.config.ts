import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. bundle default
    // esm
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm/bundle-default',
      },
    }),
    // cjs
    generateBundleCjsConfig({
      output: {
        distPath: './dist/cjs/bundle-default',
      },
    }),
    // 1. bundle inline
    // esm
    generateBundleEsmConfig({
      output: {
        distPath: './dist/esm/bundle-inline',
        dataUriLimit: {
          svg: 4096,
        },
      },
    }),
    // cjs
    generateBundleCjsConfig({
      output: {
        distPath: './dist/cjs/bundle-inline',
        dataUriLimit: {
          svg: 4096,
        },
      },
    }),
    // 2. bundleless default
    // esm
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/esm/bundleless-default',
      },
    }),
    // cjs
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: './dist/cjs/bundleless-default',
      },
    }),

    // 3. bundleless esm inline
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: './dist/esm/bundleless-inline',
        dataUriLimit: {
          svg: 4096,
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: './dist/cjs/bundleless-inline',
        dataUriLimit: {
          svg: 4096,
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
