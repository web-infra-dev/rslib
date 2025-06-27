import { defineConfig } from '@rstest/core';

export default defineConfig({
  // test: {
  // ...shared,
  globals: true,
  testEnvironment: 'node',
  testTimeout: 60000,
  restoreMocks: true,
  exclude: ['**/node_modules/**'],
  name: 'unit',
  // },
});
