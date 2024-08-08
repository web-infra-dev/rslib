import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      ...generateBundleEsmConfig(__dirname),
      autoExternal: false,
    },
    {
      ...generateBundleCjsConfig(__dirname),
      autoExternal: false,
    },
  ],
  source: {
    entry: {
      main: './src/index.ts',
    },
  },
});
