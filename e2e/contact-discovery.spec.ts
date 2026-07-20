import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")
})

test("composes search age ranges and clear behavior", async ({ page }) => {
  await page
    .getByRole("searchbox", { name: "Search contacts" })
    .fill("San Francisco")
  await expect(page.getByRole("status")).toHaveText("Showing 5 of 6 contacts")

  await page
    .getByRole("combobox", { name: "Age range" })
    .selectOption("Seniors")
  await expect(page.getByRole("status")).toHaveText("Showing 2 of 6 contacts")
  await expect(page.getByText("Tadas Petrokas")).toBeVisible()
  await expect(page.getByText("Yohan Marion")).toBeVisible()

  await page.getByRole("button", { name: "Clear" }).click()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")

  await page
    .getByRole("searchbox", { name: "Search contacts" })
    .fill("No such contact")
  await expect(
    page.getByRole("heading", { name: "No matching contacts" }),
  ).toBeVisible()
})

test("persists favorite contacts and filters to them", async ({ page }) => {
  await page
    .getByRole("button", { name: "Add Jessica Christian to favorites" })
    .click()
  await expect(
    page.getByText("Jessica Christian added to favorites."),
  ).toBeVisible()

  await page.getByRole("button", { name: "Favorites only" }).click()
  await expect(page.getByRole("status")).toHaveText("Showing 1 of 6 contacts")
  await expect(
    page.getByText("Jessica Christian", { exact: true }),
  ).toBeVisible()
  await expect(page.getByText("Lia Bekyan")).toBeHidden()

  await page.reload()

  await expect(
    page.getByRole("button", {
      name: "Remove Jessica Christian from favorites",
    }),
  ).toHaveAttribute("aria-pressed", "true")
})
