import { defineConfig } from 'vitest/config';
import { shared } from '../vitest.workspace';

export default defineConfig({
  test: {
    ...shared,
    name: 'features',
    setupFiles: ['./setupVitestTests.ts'],
    include: ['./features/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
});
