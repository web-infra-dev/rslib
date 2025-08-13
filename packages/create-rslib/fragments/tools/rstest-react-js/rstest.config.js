import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'jsdom',
  setupFiles: ['./rstest.setup.js'],
  plugins: [pluginReact()],
});
