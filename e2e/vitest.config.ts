import { defineConfig } from 'vitest/config';
import { shared } from '../vitest.workspace';

export default defineConfig({
  test: {
    ...shared,
    name: 'artifact',
    setupFiles: ['./setupVitestTests.ts'],
    include: ['./cases/**/*.test.ts'],
    exclude: ['./cases/**/*.pw.test.ts', '**/node_modules/**'],
  },
});
