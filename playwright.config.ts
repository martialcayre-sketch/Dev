import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
