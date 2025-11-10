import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: 0,
  fullyParallel: false,
  projects: [
    {
      name: 'patient',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3020',
      },
      testMatch: /.*patient.*\.spec\.ts/,
    },
    {
      name: 'practitioner',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3010',
      },
      testMatch: /.*practitioner.*\.spec\.ts/,
    },
    {
      name: 'redirects',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3020',
      },
      testMatch: /redirects\.spec\.ts/,
    },
  ],
  use: {
    headless: true,
    trace: 'on-first-retry',
  },
});
