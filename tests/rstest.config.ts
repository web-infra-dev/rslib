// import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from '@rstest/core';
// import { shared } from '../vitest.workspace';

export default defineConfig({
  globals: true,
  testEnvironment: 'node',
  testTimeout: 60000,
  restoreMocks: true,
  // exclude: ['**/node_modules/**'],

  // test: {
  // ...shared,
  name: 'integration',
  setupFiles: ['./setupRstestTests.ts'],
  include: ['./integration/**/*.test.ts'],
  exclude: ['**/node_modules/**'],
  // benchmark: {
  //   include: ['./benchmark/**/*.bench.ts'],
  // },
  // },
  // Don't run CodSpeed locally as no instruments are setup.
  // plugins: [!!process.env.CI && codspeedPlugin()].filter(Boolean),
});
