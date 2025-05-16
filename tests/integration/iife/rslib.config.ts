import { defineConfig } from '@rslib/core';
import { generateBundleIifeConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleIifeConfig({
      output: {
        externals: ['globalHelper'],
      },
    }),
  ],
});
