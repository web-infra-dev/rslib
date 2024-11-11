import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      redirect: {
        style: false,
      },
    }),
    generateBundleCjsConfig({
      bundle: false,
      redirect: {
        style: false,
      },
    }),
  ],
  source: {
    entry: {
      index: ['./src/index.ts'],
    },
  },
  output: {
    target: 'web',
    copy: [{ from: './src/index.less' }, { from: './src/style.module.less' }],
  },
});
