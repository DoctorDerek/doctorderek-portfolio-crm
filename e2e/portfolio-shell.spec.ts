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
  await expect(page.getByRole("main")).toHaveCount(1)
  await expect(page.locator("#main-content")).toHaveCount(1)
  await expect(page.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "#main-content",
  )
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")
  await expect(page.getByText("Jessica Christian")).toBeVisible()
})

test("uses expanded, compact, and narrow header layouts", async ({ page }) => {
  const navigation = page.getByRole("navigation")
  const compactIdentity = navigation.getByText("CRM by @DoctorDerek", {
    exact: true,
  })
  const desktopAttribution = navigation.getByText("by @DoctorDerek", {
    exact: true,
  })
  const home = navigation.getByRole("link", { name: "Home" })
  const filter = navigation.getByRole("link", { name: "Filter" })
  const themeToggle = navigation.getByRole("button", {
    name: /Use (dark|light) mode/,
  })
  const portfolioHeading = navigation.getByText("Portfolio CRM", {
    exact: true,
  })
  const openNavigation = navigation.getByRole("button", {
    name: "Open navigation",
  })

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.reload()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")

  for (const desktopHeaderElement of [
    desktopAttribution,
    home,
    filter,
    themeToggle,
    portfolioHeading,
  ]) {
    await expect(desktopHeaderElement).toBeVisible()
  }
  await expect(compactIdentity).toBeHidden()
  await expect(openNavigation).toBeHidden()
  await expect(desktopAttribution).toHaveCSS("text-transform", "none")

  const desktopElementVerticalCenters = await Promise.all(
    [desktopAttribution, home, filter, themeToggle, portfolioHeading].map(
      async (desktopHeaderElement) => {
        const boundingBox = await desktopHeaderElement.boundingBox()
        expect(boundingBox).not.toBeNull()
        return boundingBox!.y + boundingBox!.height / 2
      },
    ),
  )
  expect(
    Math.max(...desktopElementVerticalCenters) -
      Math.min(...desktopElementVerticalCenters),
  ).toBeLessThanOrEqual(1)

  await page.setViewportSize({ width: 1024, height: 768 })
  await page.reload()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")

  await expect(compactIdentity).toBeVisible()
  await expect(compactIdentity).toHaveCSS("text-transform", "none")
  await expect(desktopAttribution).toBeHidden()
  await expect(openNavigation).toBeVisible()
  await expect(themeToggle).toBeVisible()
  await expect(home).toBeHidden()
  await expect(filter).toBeHidden()
  await expect(portfolioHeading).toBeHidden()

  const compactElementVerticalCenters = await Promise.all(
    [compactIdentity, themeToggle, openNavigation].map(
      async (compactHeaderElement) => {
        const boundingBox = await compactHeaderElement.boundingBox()
        expect(boundingBox).not.toBeNull()
        return boundingBox!.y + boundingBox!.height / 2
      },
    ),
  )
  expect(
    Math.max(...compactElementVerticalCenters) -
      Math.min(...compactElementVerticalCenters),
  ).toBeLessThanOrEqual(1)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")

  await expect(compactIdentity).toBeVisible()
  await expect(desktopAttribution).toBeHidden()
  await expect(openNavigation).toBeVisible()
  await expect(themeToggle).toBeVisible()
  await expect(home).toBeHidden()
  await expect(filter).toBeHidden()
  await expect(portfolioHeading).toBeHidden()

  const compactIdentityBoundingBox = await compactIdentity.boundingBox()
  const navigationBoundingBox = await navigation.boundingBox()
  const openNavigationBoundingBox = await openNavigation.boundingBox()
  const themeToggleBoundingBox = await themeToggle.boundingBox()
  expect(compactIdentityBoundingBox).not.toBeNull()
  expect(navigationBoundingBox).not.toBeNull()
  expect(openNavigationBoundingBox).not.toBeNull()
  expect(themeToggleBoundingBox).not.toBeNull()
  expect(
    Math.abs(
      compactIdentityBoundingBox!.y +
        compactIdentityBoundingBox!.height / 2 -
        (openNavigationBoundingBox!.y + openNavigationBoundingBox!.height / 2),
    ),
  ).toBeLessThanOrEqual(1)
  expect(themeToggleBoundingBox!.y).toBeGreaterThan(
    Math.max(
      compactIdentityBoundingBox!.y + compactIdentityBoundingBox!.height,
      openNavigationBoundingBox!.y + openNavigationBoundingBox!.height,
    ),
  )
  expect(
    Math.abs(
      themeToggleBoundingBox!.x +
        themeToggleBoundingBox!.width / 2 -
        (navigationBoundingBox!.x + navigationBoundingBox!.width / 2),
    ),
  ).toBeLessThanOrEqual(1)
})

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
]) {
  test(`contains the mobile layout at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto("/")
    await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")

    const documentWidth = await page.evaluate(() => ({
      documentScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }))

    expect(documentWidth.documentScrollWidth).toBeLessThanOrEqual(
      documentWidth.viewportWidth,
    )
  })
}

test("serves immutable portraits without runtime transformations", async ({
  page,
}) => {
  const transformationRequests: string[] = []

  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/_next/image")
      transformationRequests.push(request.url())
  })

  await page.reload()
  await expect(page.getByRole("status")).toHaveText("Showing 6 of 6 contacts")

  const portraitSources = await page
    .locator("#main-content img[alt]")
    .evaluateAll((images) =>
      images.map((image) => new URL((image as HTMLImageElement).src).pathname),
    )

  expect(portraitSources).toHaveLength(6)
  expect(new Set(portraitSources).size).toBe(6)
  for (const portraitSource of portraitSources) {
    expect(portraitSource).toMatch(
      /^\/_next\/static\/media\/[a-z-]+\.[a-z0-9_-]+\.webp$/,
    )

    const portraitResponse = await page.request.get(portraitSource)
    expect(portraitResponse.status()).toBe(200)
    expect(portraitResponse.headers()["cache-control"]).toMatch(
      /max-age=31536000.*immutable/,
    )
  }
  expect(transformationRequests).toEqual([])
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

test("uses the browser reduced-motion preference without an app override", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.reload()

  await expect(page.getByLabel("Motion preference")).toHaveCount(0)
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-motion-preference",
  )
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((element) => getComputedStyle(element).scrollBehavior),
    )
    .toBe("auto")

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
})

test("keeps decorative motion available when the browser allows it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.reload()

  await expect(page.getByLabel("Motion preference")).toHaveCount(0)
  await page.getByRole("button", { name: "Open navigation" }).click()
  await expect(page.locator("canvas")).toBeVisible()
})
