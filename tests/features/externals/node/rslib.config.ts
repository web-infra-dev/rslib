import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

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
