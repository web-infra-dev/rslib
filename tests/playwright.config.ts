import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  // Playwright test files with `.pw.` to distinguish from Rstest test files
  testMatch: /.*pw.(test|spec).(js|ts|mjs)/,
  // Retry on CI
  retries: isCI ? 3 : 0,
  // Print line for each test being run in CI
  reporter: 'list',
  use: {
    channel: isCI ? 'chrome' : undefined,
  },
  expect: {
    timeout: isCI ? 30_000 : 5_000,
  },
  webServer: [
    {
      command: 'cd ../examples/module-federation && npm run dev:host',
      url: 'http://localhost:3000',
      timeout: 120 * 1000,
    },
    {
      command: 'cd ../examples/module-federation && npm run serve:lib',
      url: 'http://localhost:3001',
      timeout: 120 * 1000,
    },
    {
      command: 'cd ../examples/module-federation && npm run dev:remote',
      url: 'http://localhost:3002',
      timeout: 120 * 1000,
    },
  ],
});
