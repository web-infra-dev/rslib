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
      syntax: ['es5'],
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
      syntax: ['es5'],
      dts: true,
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
  ],
  output: {
    minify: false,
    target: 'web',
  },
  plugins: [pluginReact(), pluginSass()],
});
