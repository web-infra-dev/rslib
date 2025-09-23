import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';
import distPathJson from './path.json';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: distPathJson.distPath,
        },
      },
    }),
  ],
});
