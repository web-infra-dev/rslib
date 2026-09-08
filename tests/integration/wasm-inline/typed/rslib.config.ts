import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
      dts: true,
      output: { distPath: './dist/bundleless' },
    }),
  ],
  output: { target: 'node' },
});
