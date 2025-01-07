import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig()],
  output: {
    externals: { 'lodash/zip': 'lodash-es/zip', 'node:fs': 'memfs' },
  },
});
