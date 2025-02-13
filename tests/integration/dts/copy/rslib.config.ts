import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      dts: true,
    }),
  ],
  output: {
    copy: {
      patterns: [
        {
          from: './copy.d.ts',
          to: './copy.d.ts',
          context: __dirname,
        },
      ],
    },
  },
});
