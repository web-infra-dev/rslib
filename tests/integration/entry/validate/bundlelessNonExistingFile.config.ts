import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      source: {
        entry: {
          index: ['./src/non-existing-file.ts', './non-existing-folder/**/*'],
        },
      },
    }),
  ],
});
