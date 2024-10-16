import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Playwright test files with `.pw.` to distinguish from Vitest test files
  testMatch: /.*pw.(test|spec).(js|ts|mjs)/,
  // Retry on CI
  retries: process.env.CI ? 3 : 0,
  // Print line for each test being run in CI
  reporter: 'list',
  webServer: [
    {
      command: 'cd ../examples/module-federation && npm run dev:host',
      url: 'http://127.0.0.1:3000',
      timeout: 60 * 1000,
    },
    {
      command: 'cd ../examples/module-federation && npm run dev:lib',
      url: 'http://127.0.0.1:3001',
      timeout: 60 * 1000,
    },
    {
      command: 'cd ../examples/module-federation && npm run dev:remote',
      url: 'http://127.0.0.1:3002',
      timeout: 60 * 1000,
    },
  ],
});
