import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      banner: {
        dts: '/*! hello banner dts composite*/',
      },
      footer: {
        dts: '/*! hello banner dts composite*/',
      },
      dts: {
        bundle: false,
        build: true,
        autoExtension: true,
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
