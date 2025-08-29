import { defineConfig } from '@rstest/core';
import { shared } from '../../rstest.config';

export default defineConfig({
  ...shared,
  name: 'unit',
  setupFiles: ['./setupRstestTests.ts'],
});
