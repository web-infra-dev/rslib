import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      wasm: { mode: 'preserve' },
    }),
    generateBundleEsmConfig({
      bundle: false,
      wasm: { mode: 'preserve' },
      output: {
        distPath: './dist/user-external',
        externals: {
          'wasm-package/add.wasm': 'mapped-wasm-package',
        },
      },
    }),
  ],
});
