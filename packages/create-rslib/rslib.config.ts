import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['es2023'],
    },
  ],
  plugins: [pluginPublint()],
});
