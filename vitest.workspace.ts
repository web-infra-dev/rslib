import { defineWorkspace } from 'vitest/config';
import type { ProjectConfig } from 'vitest/node';

export const shared: ProjectConfig = {
  globals: true,
  environment: 'node',
  testTimeout: 30000,
  restoreMocks: true,
  exclude: ['**/node_modules/**'],
};

export default defineWorkspace(['packages/*', 'e2e']);
