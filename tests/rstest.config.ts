// import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from '@rstest/core';
import { shared } from '../rstest.config';

export default defineConfig({
  projects: [
    {
      ...shared,
      name: 'integration',
      setupFiles: ['./setupRstestTests.ts'],
      include: ['./integration/**/*.test.ts'],
      exclude: ['**/node_modules/**', './integration/exe/*.test.ts'],
      // TODO: Support benchmark in Rstest.
      // benchmark: {
      //   include: ['./benchmark/**/*.bench.ts'],
      // },
      // },
      // Don't run CodSpeed locally as no instruments are setup.
      // plugins: [!!process.env.CI && codspeedPlugin()].filter(Boolean),
    },
    // Keep exe tests in a separate nested project so eco CI can skip these
    // slower SEA cases, while the workflow can still run them in parallel.
    {
      ...shared,
      name: 'integration-exe',
      setupFiles: ['./setupRstestTests.ts'],
      include: ['./integration/exe/*.test.ts'],
    },
  ],
});
