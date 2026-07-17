import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ThemeSwitch from "@/components/ThemeSwitch"

const { setTheme, themeState } = vi.hoisted(() => ({
  setTheme: vi.fn(),
  themeState: {
    resolvedTheme: "light" as "dark" | "light",
  },
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: themeState.resolvedTheme,
    setTheme,
  }),
}))

const themeToggleTestCases = [
  {
    accessibleName: "Use dark mode",
    isPressed: false,
    requestedTheme: "dark",
    resolvedTheme: "light",
  },
  {
    accessibleName: "Use light mode",
    isPressed: true,
    requestedTheme: "light",
    resolvedTheme: "dark",
  },
] as const

describe("theme switch", () => {
  beforeEach(() => {
    setTheme.mockReset()
    themeState.resolvedTheme = "light"
  })

  it.each(themeToggleTestCases)(
    "requests $requestedTheme from the resolved $resolvedTheme theme",
    ({ accessibleName, isPressed, requestedTheme, resolvedTheme }) => {
      themeState.resolvedTheme = resolvedTheme

      render(<ThemeSwitch />)

      const themeSwitch = screen.getByRole("button", {
        name: accessibleName,
      })

      expect(themeSwitch).toHaveAttribute("aria-pressed", String(isPressed))
      expect(themeSwitch.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      )

      fireEvent.click(themeSwitch)

      expect(setTheme).toHaveBeenCalledOnce()
      expect(setTheme).toHaveBeenCalledWith(requestedTheme)
    },
  )

  it("applies completed animation states to the referenced button", async () => {
    const { rerender } = render(<ThemeSwitch />)

    themeState.resolvedTheme = "dark"
    rerender(<ThemeSwitch />)

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Use light mode" }),
      ).toHaveClass("switch-enter-done")
    })

    themeState.resolvedTheme = "light"
    rerender(<ThemeSwitch />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Use dark mode" })).toHaveClass(
        "switch-exit-done",
      )
    })
  })
})
