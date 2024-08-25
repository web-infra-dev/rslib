import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        target: 'node',
        externals: { foo: 'node-commonjs foo' },
      },
    }),
    generateBundleCjsConfig({
      output: { target: 'node', externals: { foo: 'foo' } },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    externals: { react: 'react', bar: 'bar' },
  },
});
