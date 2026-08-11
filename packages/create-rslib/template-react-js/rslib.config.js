import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  bundle: false,
  output: {
    target: 'web',
  },
  plugins: [pluginReact()],
});
