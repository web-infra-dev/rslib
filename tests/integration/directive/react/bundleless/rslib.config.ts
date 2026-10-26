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
        minify: {
          jsOptions: {
            minimizerOptions: {
              compress: {
                // `directives` option is required to keep `"use strict"` in the output files.
                directives: false,
                // Do not let variable joining hide an incorrectly placed shim.
                join_vars: false,
              },
            },
          },
        },
        distPath: './dist/cjs',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        distPath: './dist/cjs-default',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        minify: false,
        distPath: './dist/cjs-no-minify',
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      output: {
        minify: {
          jsOptions: {
            minimizerOptions: {
              compress: {
                directives: false,
                join_vars: true,
              },
            },
          },
        },
        distPath: './dist/cjs-join-vars',
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
