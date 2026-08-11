import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  bundle: false,
  dts: true,
  output: {
    target: 'web',
  },
  plugins: [
    pluginReact({
      reactCompiler: true,
    }),
  ],
});
