import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
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
        'lodash/add': false,
        'lodash/drop': 'commonjs lodash/drop',
        e8: ['module e8'],
      },
      /e6/,
      'e7',
    ],
  },
  performance: {
    buildCache: false,
  },
});
