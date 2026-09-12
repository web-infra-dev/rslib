import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  bundle: false,
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
