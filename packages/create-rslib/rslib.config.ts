import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from 'rslib';

export default defineConfig({
  lib: [{ format: 'esm' }],
  plugins: [pluginPublint()],
});
