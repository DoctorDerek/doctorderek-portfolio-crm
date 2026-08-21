import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")
})

test("creates updates deletes and resets local contacts", async ({ page }) => {
  const pageErrors: string[] = []
  page.on("pageerror", (error) => pageErrors.push(error.message))

  await page.getByRole("button", { name: "+ Add Contact" }).click()
  await expect(
    page.getByText("Create Phone Book Entry", { exact: true }),
  ).toBeVisible()
  await page.getByLabel("Email Address").fill("mapachito@example.com")
  await page.getByLabel("First Name").fill("Mapachito")
  await page.getByLabel("Last Name").fill("Austin")
  await page.getByLabel("Date of Birth - Month").fill("07")
  await page.getByLabel("Date of Birth - Day").fill("11")
  await page.getByLabel("Date of Birth - Year").fill("1980")
  await page.getByLabel("Phone Number").fill("555-867-5309")
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await expect(
    page.getByRole("region", { name: "Review and Submit" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Edit Mapachito Austin" }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Submit", exact: true }).click()

  await expect(page.getByText("Contact created.")).toBeVisible()
  await expect(
    page.getByText("Mapachito Austin", { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole("status")).toHaveText("Showing 7 of 7 contacts")

  await page.getByRole("button", { name: "Edit Mapachito Austin" }).click()
  await expect(
    page.getByRole("region", { name: "Contact information" }),
  ).toBeVisible()
  await page.getByLabel("First Name").fill("Mapachote")
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await expect(
    page.getByRole("region", { name: "Review and Submit" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Submit", exact: true }).click()

  expect(pageErrors).toEqual([])
  await expect(page.getByText("Contact updated.")).toBeVisible()
  await expect(
    page.getByText("Mapachote Austin", { exact: true }),
  ).toBeVisible()

  await page.getByRole("button", { name: /Delete Mapachote Austin/ }).click()
  await expect(
    page.getByText("Delete Phone Book Entry", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Submit", exact: true }).click()

  await expect(page.getByText("Contact deleted.")).toBeVisible()
  await expect(page.getByText("Mapachote Austin", { exact: true })).toBeHidden()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")

  await page
    .getByRole("button", {
      name: "Reset contacts to the demonstration contacts",
    })
    .click()
  await expect(page.getByText("Reset Contacts", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Submit", exact: true }).click()

  await expect(page.getByText("Contacts reset.")).toBeVisible()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")
})
