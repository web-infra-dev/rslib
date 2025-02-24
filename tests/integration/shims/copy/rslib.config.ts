import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleCjsConfig({
      shims: { esm: { __dirname: true, __filename: true } },
    }),
  ],
  output: {
    copy: ['./src/a/index.ts'],
  },
});
