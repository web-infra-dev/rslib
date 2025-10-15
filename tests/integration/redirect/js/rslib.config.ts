import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0 default
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: 'dist/default/esm',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: 'dist/default/cjs',
      },
    }),
    // 1 js.path: false
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: 'dist/js-path-false/esm',
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
        distPath: 'dist/js-path-false/cjs',
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
        distPath: 'dist/js-path-externals-override/esm',
        externals: {
          '@/foo': './others/foo.js',
          '@/bar': './others/bar/index.js',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: 'dist/js-path-externals-override/cjs',
        externals: {
          '@/foo': './others/foo.cjs',
          '@/bar': './others/bar/index.cjs',
        },
      },
    }),
    // 3 js.path with user override alias
    generateBundleEsmConfig({
      bundle: false,
      resolve: {
        alias: {
          '@/foo': './src/others/foo',
          '@/bar': './src/others/bar',
        },
        aliasStrategy: 'prefer-alias',
      },
      output: {
        distPath: 'dist/js-path-alias-override/esm',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      resolve: {
        alias: {
          '@/foo': './src/others/foo',
          '@/bar': './src/others/bar',
        },
        aliasStrategy: 'prefer-alias',
      },
      output: {
        distPath: 'dist/js-path-alias-override/cjs',
      },
    }),
    // 4 js.extension: false
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: 'dist/js-extension-false/esm',
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
        distPath: 'dist/js-extension-false/cjs',
      },
      redirect: {
        js: {
          extension: false,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '~': './src',
    },
  },
  source: {
    entry: {
      index: './src/**',
    },
  },
});
