import { defineConfig } from '@rslib/core';
import { fileURLToPath } from 'node:url';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: {
        autoExtension: true,
        typescriptPath: fileURLToPath(import.meta.resolve('typescript7-api')),
      },
    }),
  ],
});
