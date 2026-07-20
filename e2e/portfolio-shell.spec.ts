import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test("loads the public Portfolio CRM with seeded contacts", async ({
  page,
}) => {
  await expect(page).toHaveTitle("Portfolio CRM by @DoctorDerek")
  await expect(
    page.getByText("Portfolio CRM", { exact: true }).first(),
  ).toBeVisible()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")
  await expect(page.getByText("Jessica Christian")).toBeVisible()
})

test("switches theme through its accessible control", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("theme", "light"))
  await page.reload()

  await page.getByRole("button", { name: "Use dark mode" }).click()

  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(
    page.getByRole("button", { name: "Use light mode" }),
  ).toBeVisible()
})

test("persists an explicit animation opt-out", async ({ page }) => {
  await page.getByRole("button", { name: "Turn animations off" }).click()
  await expect(
    page.getByRole("button", { name: "Turn animations on" }),
  ).toHaveAttribute("aria-pressed", "false")

  await page.reload()

  await expect(
    page.getByRole("button", { name: "Turn animations on" }),
  ).toBeVisible()
})
