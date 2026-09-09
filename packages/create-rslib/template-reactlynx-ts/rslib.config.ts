import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  bundle: false,
  dts: true,
  output: {
    target: 'web',
    filename: {
      js: '[name].jsx',
    },
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'preserve',
      },
    }),
  ],
});
