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

test("honors and persists tri-state reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.reload()

  const reducedMotionSelect = page.getByLabel("Reduced motion")
  await expect(reducedMotionSelect).toHaveValue("system")
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-preference",
    "system",
  )
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((element) => getComputedStyle(element).scrollBehavior),
    )
    .toBe("auto")

  await reducedMotionSelect.selectOption("full")

  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-preference",
    "full",
  )
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((element) => getComputedStyle(element).scrollBehavior),
    )
    .toBe("smooth")
  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("portfolio-crm-motion-preference"),
      ),
    )
    .toBe("full")

  await page.reload()

  await expect(page.getByLabel("Reduced motion")).toHaveValue("full")

  await page.getByLabel("Reduced motion").selectOption("reduce")
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-preference",
    "reduce",
  )
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((element) => getComputedStyle(element).scrollBehavior),
    )
    .toBe("auto")
})

test("applies reduced motion to theme artwork and confetti", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel("Reduced motion").selectOption("reduce")
  await page.getByRole("button", { name: "Use dark mode" }).click()

  await expect
    .poll(() =>
      page
        .locator(".sun")
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    )
    .toBe("0s")

  await page.getByRole("button", { name: "Open navigation" }).click()
  await expect(page.locator("canvas")).toHaveCount(0)
  await page.getByRole("button", { name: "Close dialog" }).click()

  await page.getByLabel("Reduced motion").selectOption("full")
  await page.getByRole("button", { name: "Use light mode" }).click()

  await expect
    .poll(() =>
      page
        .locator(".sun")
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    )
    .toBe("0.8s")

  await page.getByRole("button", { name: "Open navigation" }).click()
  await expect(page.locator("canvas")).toBeVisible()
})
