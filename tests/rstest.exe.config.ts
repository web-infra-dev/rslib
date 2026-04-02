import { defineConfig } from '@rstest/core';
import { shared } from '../rstest.config';

export default defineConfig({
  ...shared,
  name: 'integration-exe',
  setupFiles: ['./setupRstestTests.ts'],
  include: ['./integration/exe/*.test.ts'],
});
