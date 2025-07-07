// TODO: projects is not supported in Rstest yet, so we use a single config file for now.

// import type { ProjectConfig } from '@rstest/core';
import type { RstestConfig } from '@rstest/core';

export const shared: RstestConfig = {
  globals: true,
  testEnvironment: 'node',
  testTimeout: 60_000,
  hookTimeout: 50_000,
  restoreMocks: true,
  exclude: ['**/node_modules/**'],
};

// export default defineWorkspace(['packages/*', 'tests']);
