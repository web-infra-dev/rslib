import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. default
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
    // 1. redirect.asset.extension: false
    generateBundleEsmConfig({
      bundle: false,
      redirect: {
        asset: {
          extension: false,
        },
      },
      output: {
        distPath: {
          root: 'dist/asset-extension-false/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      redirect: {
        asset: {
          extension: false,
        },
      },
      output: {
        distPath: {
          root: 'dist/asset-extension-false/cjs',
        },
      },
    }),
    // 2. redirect.asset.path: false
    generateBundleEsmConfig({
      bundle: false,
      redirect: {
        asset: {
          path: false,
        },
      },
      output: {
        distPath: {
          root: 'dist/asset-path-false/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      redirect: {
        asset: {
          path: false,
        },
      },
      output: {
        distPath: {
          root: 'dist/asset-path-false/cjs',
        },
      },
    }),
    // 3. redirect.asset.extension: false + redirect.asset.path: false
    generateBundleEsmConfig({
      bundle: false,
      redirect: {
        asset: {
          path: false,
          extension: false,
        },
      },
      output: {
        distPath: {
          root: 'dist/asset-false/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      redirect: {
        asset: {
          path: false,
          extension: false,
        },
      },
      output: {
        distPath: {
          root: 'dist/asset-false/cjs',
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
});
