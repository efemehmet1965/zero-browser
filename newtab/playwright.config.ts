import { defineConfig } from '@playwright/test';

// ZERO e2e — gercek Firefox (Playwright firefox-1509) + `npm run preview`.
// Calistirma: once `npm run preview -- --port 4173`, sonra `npm run test:e2e`.
export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  use: {
    browserName: 'firefox',
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: 'list',
});
