import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, {
      dts: {
        bundle: true,
        abortOnError: false,
      },
    }),
    generateBundleCjsConfig(__dirname),
  ],
  source: {
    entry: {
      main: './src/index.ts',
    },
    tsconfigPath: 'tsconfig.json',
  },
});
