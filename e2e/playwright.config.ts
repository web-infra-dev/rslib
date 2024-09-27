import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Playwright test files with `.pw.` to distinguish from Vitest test files
  testMatch: /.*pw.(test|spec).(js|ts|mjs)/,
  // Retry on CI
  retries: process.env.CI ? 3 : 0,
  // Print line for each test being run in CI
  reporter: 'list',
});
