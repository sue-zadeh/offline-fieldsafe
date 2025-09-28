import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './testing',
  testMatch: '**/api-*.spec.ts',
  use: {
    baseURL: 'http://localhost:5000',
  },
  projects: [
    {
      name: 'api-tests',
      testMatch: '**/api-*.spec.ts',
    },
  ],
})
