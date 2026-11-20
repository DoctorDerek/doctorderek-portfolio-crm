import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ThemeToggle from "@/components/ThemeToggle"

const themeToggleTestCases = [
  {
    accessibleName: "Use dark mode",
    isPressed: false,
    isDarkTheme: false,
  },
  {
    accessibleName: "Use light mode",
    isPressed: true,
    isDarkTheme: true,
  },
] as const

describe("theme toggle", () => {
  const onToggle = vi.fn()

  beforeEach(() => {
    onToggle.mockReset()
  })

  it.each(themeToggleTestCases)(
    "renders the $accessibleName state and delegates its action",
    ({ accessibleName, isDarkTheme, isPressed }) => {
      render(<ThemeToggle isDarkTheme={isDarkTheme} onToggle={onToggle} />)

      const themeSwitch = screen.getByRole("button", {
        name: accessibleName,
      })

      expect(themeSwitch).toHaveAttribute("aria-pressed", String(isPressed))
      expect(themeSwitch.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      )

      fireEvent.click(themeSwitch)

      expect(onToggle).toHaveBeenCalledOnce()
    },
  )

  it("updates the CSS theme state when the theme changes", () => {
    const { rerender } = render(
      <ThemeToggle isDarkTheme={false} onToggle={onToggle} />,
    )

    rerender(<ThemeToggle isDarkTheme onToggle={onToggle} />)
    expect(
      screen.getByRole("button", { name: "Use light mode" }),
    ).toHaveAttribute("aria-pressed", "true")

    rerender(<ThemeToggle isDarkTheme={false} onToggle={onToggle} />)
    expect(
      screen.getByRole("button", { name: "Use dark mode" }),
    ).toHaveAttribute("aria-pressed", "false")
  })
})
