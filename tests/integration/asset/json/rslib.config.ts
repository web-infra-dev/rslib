import { pluginToml } from '@rsbuild/plugin-toml';
import { pluginYaml } from '@rsbuild/plugin-yaml';
import { defineConfig } from '@rslib/core';
import { generateBundleEsmConfig } from 'test-helper';

export default defineConfig({
  lib: [
    // 0. bundle default
    // esm
    generateBundleEsmConfig({
      output: {
        distPath: {
          root: './dist/esm/bundle',
        },
      },
    }),

    // 1. bundleless default
    // esm
    generateBundleEsmConfig({
      bundle: false,
      output: {
        distPath: {
          root: './dist/esm/bundleless',
        },
      },
    }),
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginYaml(), pluginToml()],
});
