import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      syntax: 'es5',
      externalHelpers: true,
      tools: {
        swc: {
          jsc: {
            externalHelpers: false,
          },
        },
      },
      output: {
        distPath: './dist/1',
      },
    }),
    generateBundleEsmConfig({
      syntax: 'es5',
      tools: {
        swc: {
          jsc: {
            externalHelpers: true,
          },
        },
      },
      output: {
        distPath: './dist/2',
      },
    }),
  ],
  source: {
    entry: {
      index: '../__fixtures__/src/index.ts',
    },
  },
});
