import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0 default
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/default/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/default/cjs',
        },
      },
    }),
    // 1 js.path: false
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/js-path-false/esm',
        },
      },
      redirect: {
        js: {
          path: false,
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/js-path-false/cjs',
        },
      },
      redirect: {
        js: {
          path: false,
        },
      },
    }),
    // 2 js.path with user override externals
    generateBundleEsmConfig({
      bundle: false,
      output: {
        externals: {
          '@/foo': './others/foo.js',
          '@/bar': './others/bar/index.js',
        },
        distPath: {
          root: 'dist/js-path-externals-override/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/js-path-externals-override/cjs',
        },
        externals: {
          '@/foo': './src/others/foo',
          '@/bar': './src/others/bar',
        },
      },
    }),
    // 3 js.extension: false
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/js-extension-false/esm',
        },
      },
      redirect: {
        js: {
          extension: false,
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: {
          root: 'dist/js-extension-false/cjs',
        },
      },
      redirect: {
        js: {
          extension: false,
        },
      },
    }),
  ],

  source: {
    entry: {
      // index: '../__fixtures__/src',
      index: './src/**',
    },
  },
});
