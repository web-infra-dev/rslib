import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: true,
      experiments: {
        advancedEsm: true,
      },
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
    pluginSass(),
  ],
});
