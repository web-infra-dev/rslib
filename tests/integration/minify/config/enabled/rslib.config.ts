import path from 'node:path';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  output: {
    minify: {
      js: true,
      jsOptions: {
        minimizerOptions: {
          format: {
            comments: 'some',
            preserve_annotations: true,
          },
        },
      },
    },
    externals: ['react/jsx-runtime'],
  },
  source: {
    entry: {
      index: path.resolve(__dirname, '../../__fixtures__/src/index.ts'),
    },
  },
});
