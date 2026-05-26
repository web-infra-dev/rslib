import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        externals: { e9: 'e9' },
      },
    }),
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    externals: [
      {
        e1: 'commonjs e1',
        e2: 'e2',
        e3: true,
        e4: ['commonjs e4'],
        e5: ['e5'],
        './local-false': false,
        e8: ['module e8'],
      },
      /e6/,
      'e7',
      /^e10$/,
      'e11',
    ],
  },
});
