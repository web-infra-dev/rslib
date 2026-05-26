import { defineConfig } from '@rslib/core';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { generateBundleCjsConfig, generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [generateBundleEsmConfig(), generateBundleCjsConfig()],
  source: {
    entry: {
      index: ['./src/index.ts'],
    },
  },
  output: {
    target: 'web',
  },
  plugins: [pluginTailwindcss()],
});
