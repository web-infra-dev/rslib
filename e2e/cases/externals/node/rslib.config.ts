import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig(__dirname, { output: { target: 'node' } }),
    generateBundleCjsConfig(__dirname, { output: { target: 'node' } }),
  ],
  source: {
    entry: {
      main: './src/index.ts',
    },
  },
  output: {
    externals: { react: 'react' },
  },
});
