import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

// `new URL()` in the source and in a package under `node_modules`.
export default defineConfig({
  lib: [generateBundleEsmConfig()],
  output: {
    target: 'web',
  },
});
