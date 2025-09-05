import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      banner: {
        dts: '/*! hello banner dts build*/',
      },
      footer: {
        dts: '/*! hello banner dts build*/',
      },
      dts: {
        bundle: false,
        build: true,
        autoExtension: true,
        tsgo: true,
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
});
