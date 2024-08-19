import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({ output: { target: 'node' } }),
    generateBundleCjsConfig({ output: { target: 'node' } }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    externals: { react: 'react' },
  },
});
