import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Playwright test files with `.pw.` to distinguish from Vitest test files
  testMatch: /.*pw.(test|spec).(js|ts|mjs)/,
  // Retry on CI
  retries: process.env.CI ? 3 : 0,
  // Print line for each test being run in CI
  reporter: 'list',
  expect: {
    timeout: process.env.CI ? 10_000 : 5_000,
  },
  webServer: [
    {
      command: 'cd ../examples/module-federation && npm run dev:host',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd ../examples/module-federation && npm run serve:lib',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd ../examples/module-federation && npm run dev:remote',
      url: 'http://localhost:3002',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
