import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from '#shared';

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
