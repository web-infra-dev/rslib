import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from 'vitest/config';
import { shared } from '../vitest.workspace';

export default defineConfig({
  test: {
    ...shared,
    name: 'integration',
    setupFiles: ['./setupVitestTests.ts'],
    include: ['./integration/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    benchmark: {
      include: ['./benchmark/**/*.bench.ts'],
    },
  },
  // Don't run CodSpeed locally as no instruments are setup.
  plugins: [!!process.env.CI && codspeedPlugin()].filter(Boolean),
});
