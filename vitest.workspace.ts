import { defineWorkspace } from 'vitest/config'

const shared = {
  globals: true,
  environment: 'node',
  testTimeout: 30000,
  restoreMocks: true,
}

export default defineWorkspace([
  {
    test: {
      ...shared,
      name: 'unit',
      include: ['packages/**/*.test.ts'],
      exclude: ['**/node_modules/**'],
    },
  },
  {
    test: {
      ...shared,
      name: 'artifact',
      include: ['e2e/cases/**/*.test.ts'],
      exclude: ['e2e/cases/**/*.pw.test.ts', '**/node_modules/**'],
    },
  },
])
