import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // ...existing config
  testDir: './testing',
  use: { baseURL: 'http://localhost:5000', headless: true, screenshot: 'only-on-failure', video: 'retain-on-failure', trace: 'on-first-retry' },

  // start server for all projects
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:5000',
    reuseExistingServer: true,
    timeout: 120_000,
  },

  projects: [
    // 1) generate storage states once
    {
      name: 'setup-auth',
      testMatch: /.*auth\.setup\.ts/,              // points to testing/setup/auth.setup.ts
    },

    // 2) normal browser project(s), depending on setup-auth
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup-auth'],
    },
  ],
});
