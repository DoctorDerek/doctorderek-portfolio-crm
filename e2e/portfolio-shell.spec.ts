import { expect, test } from "@playwright/test"

const persistedThemeTestCases = [
  {
    colorScheme: "dark",
    expectedAccessibleName: "Use dark mode",
    expectedDarkTheme: false,
    storedTheme: "light",
  },
  {
    colorScheme: "light",
    expectedAccessibleName: "Use light mode",
    expectedDarkTheme: true,
    storedTheme: "dark",
  },
  {
    colorScheme: "dark",
    expectedAccessibleName: "Use light mode",
    expectedDarkTheme: true,
    storedTheme: "system",
  },
  {
    colorScheme: "light",
    expectedAccessibleName: "Use dark mode",
    expectedDarkTheme: false,
    storedTheme: "system",
  },
] as const

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
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("dark")

  await page.reload()

  const persistedThemeToggle = page.getByRole("button", {
    name: "Use light mode",
  })
  await expect(persistedThemeToggle).toBeVisible()
  await persistedThemeToggle.focus()
  await expect(persistedThemeToggle).toBeFocused()
})

for (const {
  colorScheme,
  expectedAccessibleName,
  expectedDarkTheme,
  storedTheme,
} of persistedThemeTestCases) {
  test(`hydrates the persisted ${storedTheme} theme against a ${colorScheme} system preference`, async ({
    page,
  }) => {
    const hydrationErrors: string[] = []

    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /hydration|server rendered html/i.test(message.text())
      ) {
        hydrationErrors.push(message.text())
      }
    })

    await page.emulateMedia({ colorScheme })
    await page.evaluate(
      (theme) => localStorage.setItem("theme", theme),
      storedTheme,
    )
    await page.reload()

    const themeToggle = page.getByRole("button", {
      name: expectedAccessibleName,
    })
    await expect(themeToggle).toBeVisible()
    await expect(themeToggle).toHaveAttribute(
      "aria-pressed",
      String(expectedDarkTheme),
    )

    if (expectedDarkTheme) {
      await expect(page.locator("html")).toHaveClass(/dark/)
    } else {
      await expect(page.locator("html")).not.toHaveClass(/dark/)
    }

    expect(hydrationErrors).toEqual([])
  })
}

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
