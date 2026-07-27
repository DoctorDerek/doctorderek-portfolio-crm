import { expect, test } from "@playwright/test"

test("opens and dismisses the create dialog entirely from the keyboard", async ({
  page,
}) => {
  await page.goto("/")

  const createContactButton = page.getByRole("button", {
    name: "+ Add Contact",
  })
  await createContactButton.focus()
  await page.keyboard.press("Enter")

  const createContactHeading = page.getByRole("heading", {
    name: "Create Phone Book Entry",
  })
  await expect(createContactHeading).toBeVisible()
  await expect(
    page.getByRole("dialog", { name: "Create Phone Book Entry" }),
  ).toBeFocused()
  const firstNameInput = page.getByRole("textbox", {
    name: "First Name",
  })
  await expect(firstNameInput).toBeVisible()

  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("keyboard@example.com")
  await firstNameInput.fill("Keyboard")
  await page.getByRole("textbox", { name: "Last Name" }).fill("User")
  const nextButton = page.getByRole("button", { name: "Next", exact: true })
  await nextButton.focus()
  await page.keyboard.press("Enter")

  await expect(
    page.getByRole("region", { name: "Review and Submit" }),
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Submit" })).toBeFocused()

  await page.keyboard.press("Escape")

  await expect(createContactHeading).toBeHidden()
  await expect(createContactButton).toBeFocused()
})

test("operates and dismisses mobile navigation entirely from the keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")

  const openNavigationButton = page.getByRole("button", {
    name: "Open navigation",
  })
  await openNavigationButton.focus()
  await page.keyboard.press("Enter")

  const navigationDialog = page.getByRole("dialog", { name: "Navigation" })
  const filterLink = navigationDialog.getByRole("link", { name: "Filter" })
  await expect(filterLink).toBeVisible()
  await filterLink.focus()
  await page.keyboard.press("Enter")

  await expect(filterLink).toBeHidden()
  await expect(page).toHaveURL(/#filter$/)
  await expect(openNavigationButton).toBeFocused()
})
