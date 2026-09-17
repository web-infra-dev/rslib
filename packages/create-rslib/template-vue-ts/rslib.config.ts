import { pluginVue } from '@rsbuild/plugin-vue';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  bundle: false,
  output: {
    target: 'web',
  },
  plugins: [pluginVue()],
});
