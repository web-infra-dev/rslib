import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

// `new URL()` references from user source and from a third-party package.
export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        externals: {
          'third-party-dep': false,
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
});
