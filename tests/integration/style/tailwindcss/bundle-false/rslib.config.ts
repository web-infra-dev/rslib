import { defineConfig } from '@rslib/core';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
    }),
    generateBundleCjsConfig({
      bundle: false,
    }),
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginTailwindcss()],
});
