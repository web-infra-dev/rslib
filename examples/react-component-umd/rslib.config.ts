import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'umd',
      umdName: 'RslibUmdExample',
      output: {
        externals: {
          react: 'React',
        },
        distPath: {
          root: './dist/umd',
        },
      },
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginReact(), pluginSass()],
});
