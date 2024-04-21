import { defineConfig } from '@playwright/test'

export default defineConfig({
  // Playwright test files with `.pw.` to distinguish from Vitest test files
  testMatch: /.*pw.(test|spec).(js|ts|mjs)/,
})
