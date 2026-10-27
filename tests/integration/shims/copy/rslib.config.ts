import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      output: {
        copy: ['./src/a/index.ts'],
      },
    }),
    generateBundleEsmConfig({
      shims: {
        esm: {
          require: true,
        },
      },
      output: {
        minify: false,
        copy: [
          {
            from: './src/a/index.ts',
            to: 'copied.js',
          },
        ],
      },
    }),
  ],
});
