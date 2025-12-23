import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 180000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npm run start -- --hostname 0.0.0.0 --port 3000",
    port: 3000,
    reuseExistingServer: false,
    timeout: 180000,
  },
  testDir: "./tests",
};

export default config;
