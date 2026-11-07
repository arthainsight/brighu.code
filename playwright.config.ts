import { defineConfig, devices } from '@playwright/test';
import { APP_VERSION } from './src/lib/config';

// Browser tests (e2e/*.spec.ts): run the production build and walk the main views.
// `npm run build` first, then `npm run test:e2e`.
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  // The page opens with the chart of now at the visitor's place and a window (the question about the place, the updates); the tests start
  // from the blank page without the window that they were written for, and the tests of the opening (e2e/opening.spec.ts) put the choice back.
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
    storageState: { cookies: [], origins: [{ origin: 'http://localhost:3100', localStorage: [{ name: 'openWithNowChart', value: 'blank' }, { name: 'lastSeenVersion', value: APP_VERSION }] }] },
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, browserName: 'chromium' } },
  ],
  webServer: {
    command: 'npx next start -p 3100',
    url: 'http://localhost:3100',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
