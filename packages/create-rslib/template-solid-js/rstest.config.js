import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig({
    libId: 'compiled',
  }),
  setupFiles: ['./tests/rstest.setup.js'],
});
