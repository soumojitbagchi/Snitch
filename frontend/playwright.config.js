import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import process from 'node:process';

const bundledBrowser = '/opt/brave.com/brave/brave';
const browserExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || (existsSync(bundledBrowser) ? bundledBrowser : null);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    launchOptions: browserExecutable
      ? { executablePath: browserExecutable }
      : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
});
