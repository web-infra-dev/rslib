import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

const esmShared = {
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
};

const bundlelessShared = {
  bundle: false,
  source: {
    entry: {
      index: './src/*',
    },
  },
};

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      output: {
        distPath: './dist/bundle/cjs0',
      },
    }),
    generateBundleCjsConfig({
      output: {
        minify: false,
        distPath: './dist/bundle/cjs1',
      },
    }),
    generateBundleCjsConfig({
      output: {
        minify: {
          jsOptions: {
            minimizerOptions: {
              compress: {
                directives: false,
                join_vars: false,
              },
            },
          },
        },
        distPath: './dist/bundle/cjs2',
      },
    }),
    generateBundleCjsConfig({
      ...bundlelessShared,
      output: {
        distPath: './dist/bundle-false/cjs0',
      },
    }),
    generateBundleCjsConfig({
      ...bundlelessShared,
      output: {
        minify: false,
        distPath: './dist/bundle-false/cjs1',
      },
    }),
    generateBundleCjsConfig({
      ...bundlelessShared,
      output: {
        minify: {
          jsOptions: {
            minimizerOptions: {
              compress: {
                directives: false,
                join_vars: false,
              },
            },
          },
        },
        distPath: './dist/bundle-false/cjs2',
      },
    }),
    generateBundleCjsConfig({
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
        distPath: './dist/bundle/cjs-join-vars',
      },
    }),
    generateBundleCjsConfig({
      ...bundlelessShared,
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
        distPath: './dist/bundle-false/cjs-join-vars',
      },
    }),
    generateBundleEsmConfig({
      ...esmShared,
      shims: { esm: { __dirname: true, __filename: true } },
      output: {
        distPath: './dist/bundle/esm0',
      },
    }),
    generateBundleEsmConfig({
      ...esmShared,
      shims: { esm: { __dirname: true, __filename: true } },
      output: {
        minify: true,
        distPath: './dist/bundle/esm1',
      },
    }),
    generateBundleEsmConfig({
      ...bundlelessShared,
      shims: { esm: { __dirname: true, __filename: true } },
      output: {
        distPath: './dist/bundle-false/esm0',
      },
    }),
    generateBundleEsmConfig({
      ...bundlelessShared,
      shims: { esm: { __dirname: true, __filename: true } },
      output: {
        minify: true,
        distPath: './dist/bundle-false/esm1',
      },
    }),
  ],
  output: {
    target: 'node',
  },
});
