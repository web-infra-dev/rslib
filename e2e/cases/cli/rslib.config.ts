import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from '#shared';

export default defineConfig({
  lib: [generateBundleEsmConfig(__dirname)],
});
