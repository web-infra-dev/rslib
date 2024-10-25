import path from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleMFConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleMFConfig({
      name: 'rslib_test_default_minify',
      exposes: {
        '.': '../../__fixtures__/src/index.ts',
      },
      shared: {
        react: {
          singleton: true,
        },
        'react-dom': {
          singleton: true,
        },
      },
    }),
  ],
  source: {
    entry: {
      index: path.resolve(__dirname, '../../__fixtures__/src/index.ts'),
    },
  },
});
