import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./scripts",
  testMatch: "*.e2e.ts",
  use: { baseURL: "http://127.0.0.1:3000", channel: "chrome" },
  reporter: "list",
  webServer: [
    {
      command: "pnpm --filter @coffee/api start",
      url: "http://127.0.0.1:3001/catalog",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm --filter @coffee/web start",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
    },
  ],
  timeout: 30000,
});
