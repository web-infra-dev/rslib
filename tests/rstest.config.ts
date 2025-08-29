// import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from '@rstest/core';
import { shared } from '../rstest.config';

export default defineConfig({
  ...shared,
  name: 'integration',
  setupFiles: ['./setupRstestTests.ts'],
  include: ['./integration/**/*.test.ts'],
  exclude: ['**/node_modules/**'],
  // TODO: Support benchmark in Rstest.
  // benchmark: {
  //   include: ['./benchmark/**/*.bench.ts'],
  // },
  // },
  // Don't run CodSpeed locally as no instruments are setup.
  // plugins: [!!process.env.CI && codspeedPlugin()].filter(Boolean),
});
