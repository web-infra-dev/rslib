import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['node 18.12.0'],
    },
  ],
  plugins: [pluginPublint()],
});
