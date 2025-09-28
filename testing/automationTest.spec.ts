import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './testing',
  timeout: 30_000,
  retries: 2, // Retry failed tests
  workers: 2, // Run tests in parallel
  use: {
    baseURL: 'http://localhost:5000',
    headless: true, // Force headless mode to reduce dependency requirements
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
})


