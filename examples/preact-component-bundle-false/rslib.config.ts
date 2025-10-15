import { pluginPreact } from '@rsbuild/plugin-preact';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
      output: {
        distPath: './dist/esm',
      },
    },
    {
      bundle: false,
      dts: true,
      format: 'cjs',
      output: {
        distPath: './dist/cjs',
      },
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginPreact(), pluginSass()],
});
