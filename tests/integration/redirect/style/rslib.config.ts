import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  plugins: [pluginLess()],
  lib: [
    // 0. default
    // style.path: true
    // style.extension: true
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

    // 1. style.path: false
    generateBundleEsmConfig({
      bundle: false,
      redirect: {
        style: {
          path: false,
        },
      },
      output: {
        distPath: {
          root: 'dist/style-path-false/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      redirect: {
        style: {
          path: false,
        },
      },
      output: {
        distPath: {
          root: 'dist/style-path-false/cjs',
        },
      },
    }),
    // 2. style.extension: false
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: ['./src/**/*.ts'],
        },
      },
      redirect: {
        style: {
          extension: false,
        },
      },
      output: {
        copy: [{ from: './**/*.less', context: './src' }],
        distPath: {
          root: 'dist/style-extension-false/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      source: {
        entry: {
          index: ['./src/**/*.ts'],
        },
      },
      redirect: {
        style: {
          extension: false,
        },
      },
      output: {
        copy: [{ from: './**/*.less', context: './src' }],
        distPath: {
          root: 'dist/style-extension-false/cjs',
        },
      },
    }),

    // 3. style.path: false
    // style.extension: false
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: ['./src/**/*.ts'],
        },
      },
      redirect: {
        style: {
          path: false,
          extension: false,
        },
      },
      output: {
        copy: [{ from: './**/*.less', context: './src' }],
        distPath: {
          root: 'dist/style-path-extension-false/esm',
        },
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      source: {
        entry: {
          index: ['./src/**/*.ts'],
        },
      },
      redirect: {
        style: {
          path: false,
        },
      },
      output: {
        copy: [{ from: './**/*.less', context: './src' }],
        distPath: {
          root: 'dist/style-path-extension-false/cjs',
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
