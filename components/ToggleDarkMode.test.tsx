import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ToggleDarkMode from "@/components/ToggleDarkMode"

const { setTheme, themeState } = vi.hoisted(() => ({
  setTheme: vi.fn(),
  themeState: {
    resolvedTheme: "light" as "dark" | "light" | "system" | undefined,
  },
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: themeState.resolvedTheme,
    setTheme,
  }),
}))

const themeAdapterTestCases = [
  {
    accessibleName: "Use dark mode",
    requestedTheme: "dark",
    resolvedTheme: "light",
  },
  {
    accessibleName: "Use light mode",
    requestedTheme: "light",
    resolvedTheme: "dark",
  },
] as const

describe("dark mode adapter", () => {
  beforeEach(() => {
    setTheme.mockReset()
    themeState.resolvedTheme = "light"
  })

  it.each(themeAdapterTestCases)(
    "requests $requestedTheme from the resolved $resolvedTheme theme",
    ({ accessibleName, requestedTheme, resolvedTheme }) => {
      themeState.resolvedTheme = resolvedTheme

      render(<ToggleDarkMode />)
      fireEvent.click(screen.getByRole("button", { name: accessibleName }))

      expect(setTheme).toHaveBeenCalledOnce()
      expect(setTheme).toHaveBeenCalledWith(requestedTheme)
    },
  )
})
