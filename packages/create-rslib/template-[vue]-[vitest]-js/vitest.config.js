/// <reference types="vitest/config" />

import pluginVue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Configure Vitest (https://vitest.dev/config/)
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
  },
  plugins: [pluginVue()],
});
