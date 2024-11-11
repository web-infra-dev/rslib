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
  // add chunkLoadingGlobal to avoid cspell error
  tools: {
    rspack: {
      output: {
        chunkLoadingGlobal: 'default_minify',
      },
    },
  },
  source: {
    entry: {
      index: path.resolve(__dirname, '../../__fixtures__/src/index.ts'),
    },
  },
  output: {
    target: 'web',
  },
});
