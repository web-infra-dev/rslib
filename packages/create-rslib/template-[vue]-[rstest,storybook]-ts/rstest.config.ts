import { defineConfig } from '@rstest/core';
import { pluginUnpluginVue } from 'rsbuild-plugin-unplugin-vue';

export default defineConfig({
  testEnvironment: 'jsdom',
  setupFiles: ['./rstest.setup.ts'],
  plugins: [pluginUnpluginVue()],
});
