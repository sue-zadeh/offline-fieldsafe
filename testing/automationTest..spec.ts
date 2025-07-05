import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './testing',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
})
