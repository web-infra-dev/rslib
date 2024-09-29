import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: {
        bundle: true,
        abortOnError: false,
      },
    }),
    generateBundleCjsConfig(),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
    tsconfigPath: 'tsconfig.json',
  },
});
