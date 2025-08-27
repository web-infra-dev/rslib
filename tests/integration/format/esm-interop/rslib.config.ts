import { defineConfig } from '@rslib/core';
import { generateBundleCjsConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleCjsConfig()],
});
