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
  plugins: [codspeedPlugin()],
});
