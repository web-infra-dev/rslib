import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({ bundle: false, dts: true }),
    generateBundleCjsConfig({ bundle: false, dts: true }),
  ],
  source: {
    entry: {
      index: ['../../__fixtures__/src/**'],
    },
    tsconfigPath: '../../__fixtures__/tsconfig.json',
  },
});
