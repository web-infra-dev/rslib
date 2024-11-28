import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        externals: { foo: 'node-commonjs foo' },
      },
    }),
    generateBundleCjsConfig({
      output: { externals: { foo: 'foo' } },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    externals: { react: 'react', bar: 'bar', './baz.mjs': './baz.mjs' },
    copy: [{ from: './src/baz.mjs' }],
  },
});
