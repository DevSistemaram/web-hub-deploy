import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: process.env.CI ? 'github' : [['html', { open: 'on-failure' }]],
  timeout: 5000,
  expect: { timeout: 4000 },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    headless: true,
    actionTimeout: 4000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
