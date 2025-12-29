import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';
import { shared } from '../../rstest.config';

export default defineConfig({
  ...shared,
  extends: withRslibConfig({
    cwd: import.meta.dirname,
  }),
  name: 'unit',
  setupFiles: ['./setupRstestTests.ts'],
});
