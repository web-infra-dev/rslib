import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  lib: [
    {
      format: 'esm',
      bundle: false,
      dts: true,
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      format: 'cjs',
      bundle: false,
      dts: true,
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
  ],
  output: {
    target: 'web',
    assetPrefix: 'auto', // TODO: move this line to packages/core/src/asset/assetConfig.ts
  },
  plugins: [pluginReact(), pluginSass()],
});
