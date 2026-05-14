import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["html", { outputFolder: "tests/report", open: "never" }], ["line"]],
  outputDir: "tests/videos",
  use: {
    baseURL: "http://localhost:2006",
    video: "on",
    screenshot: "on",
    trace: "off",
    viewport: { width: 1280, height: 720 },
    locale: "es-MX",
    timezoneId: "America/Tijuana",
    // Makes interactions look natural on video
    launchOptions: {
      slowMo: 600,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
