import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. bundle default
    // esm
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle-default',
        },
      },
    }),
    // cjs
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs/bundle-default',
        },
      },
    }),
    // 1. bundle inline
    // esm
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle-inline',
        },
        dataUriLimit: {
          svg: 4096,
        },
      },
    }),
    // cjs
    generateBundleCjsConfig({
      output: {
        distPath: {
          root: './dist/cjs/bundle-inline',
        },
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
        distPath: {
          root: './dist/esm/bundleless-default',
        },
      },
    }),
    // cjs
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/cjs/bundleless-default',
        },
      },
    }),

    // TODO: inline in bundleless, modern module has no this feature, so pending
    // 3. bundleless esm inline
    // generateBundleEsmConfig({
    //   bundle: false,
    //   output: {
    //     distPath: {
    //       root: './dist/esm/bundleless-inline',
    //     },
    //     dataUriLimit: {
    //       svg: 4096,
    //     },
    //   },
    // }),
  ],
  output: {
    target: 'web',
  },
});
