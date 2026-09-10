import { defineConfig } from '@playwright/test';

// ZERO e2e — gercek Firefox (Playwright firefox) + `npm run preview`.
// Calistirma: `npm run test:e2e` (preview otomatik acilir; CI'da da ayni).
export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
  use: {
    browserName: 'firefox',
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: 'list',
});
