import { pluginPreact } from '@rsbuild/plugin-preact';
import { pluginSass } from '@rsbuild/plugin-sass';
import { type LibConfig, defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      bundle: false,
      dts: true,
      format: 'cjs',
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginPreact(), pluginSass()],
});
