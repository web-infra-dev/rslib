import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { defineConfig } from '@rslib/core';
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
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  plugins: [pluginReact(), pluginSvgr()],
});
