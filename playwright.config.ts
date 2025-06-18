// Playwright-Konfiguration für End-to-End-Tests

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  use: {
    baseURL: 'https://localhost:3001',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'npm run dev',
    port: 3001,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
