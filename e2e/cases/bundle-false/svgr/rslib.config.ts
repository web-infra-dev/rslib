import { generateBundleCjsConfig, generateBundleEsmConfig } from '@e2e/helper';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    generateBundleEsmConfig({
      bundle: false,
    }),
    generateBundleCjsConfig({
      bundle: false,
    }),
  ],
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  plugins: [pluginReact(), pluginSvgr()],
});
