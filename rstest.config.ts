// import type { ProjectConfig } from '@rstest/core';
import { defineConfig, type RstestConfig } from '@rstest/core';

export const shared: RstestConfig = {
  globals: true,
  testEnvironment: 'node',
  testTimeout: 60_000,
  hookTimeout: 50_000,
  restoreMocks: true,
};

export default defineConfig({
  projects: ['packages/*', 'tests'],
  pool: {
    // Leave some workers available for DTS tests to spawn sub processes
    maxWorkers: '80%',
  },
});
