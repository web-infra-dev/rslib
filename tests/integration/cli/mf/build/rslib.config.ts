import { defineConfig } from '@rslib/core';
import { generateBundleMFConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleMFConfig({ name: 'test-build' })],
});
