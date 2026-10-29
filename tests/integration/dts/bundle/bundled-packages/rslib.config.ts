import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
      },
      output: {
        distPath: './dist/esm/default',
      },
    }),
    generateBundleEsmConfig({
      dts: {
        bundle: {
          bundledPackages: [],
        },
      },
      output: {
        distPath: './dist/esm/override-empty-array',
      },
    }),
    generateBundleEsmConfig({
      dts: {
        bundle: {
          bundledPackages: [
            '@reduxjs/toolkit',
            '@standard-schema/spec',
            '@standard-schema/utils',
            'immer',
            'redux',
            'redux-thunk',
            'reselect',
          ],
        },
      },
      output: {
        distPath: './dist/esm/override-array-string',
      },
    }),
    generateBundleEsmConfig({
      dts: {
        bundle: true,
      },
      output: {
        externals: [/^@reduxjs\/toolkit$/],
        distPath: './dist/esm/regexp-externals',
      },
    }),
    generateBundleEsmConfig({
      dts: {
        bundle: {
          bundledPackages: ['@reduxjs/toolkit'],
        },
      },
      output: {
        externals: [/^@reduxjs\/toolkit$/],
        distPath: './dist/esm/bundled-packages-priority',
      },
    }),
  ],
});
