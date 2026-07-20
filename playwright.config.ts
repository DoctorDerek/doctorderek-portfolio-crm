import { defineConfig, devices } from "@playwright/test"

const LOCAL_PLAYWRIGHT_BASE_URL = "http://localhost:3100"
const vercelTrustedOidcToken = process.env.PLAYWRIGHT_VERCEL_TRUSTED_OIDC_TOKEN

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || LOCAL_PLAYWRIGHT_BASE_URL,
    extraHTTPHeaders: vercelTrustedOidcToken
      ? { "x-vercel-trusted-oidc-idp-token": vercelTrustedOidcToken }
      : undefined,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  ...(process.env.PLAYWRIGHT_TEST_BASE_URL
    ? {}
    : {
        webServer: {
          command: "pnpm dev --port 3100",
          url: LOCAL_PLAYWRIGHT_BASE_URL,
          reuseExistingServer: !process.env.CI,
        },
      }),
})
