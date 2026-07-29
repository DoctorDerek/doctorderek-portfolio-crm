import { render, screen } from "@testing-library/react"
import { ReactElement, ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import RootLayout from "@/app/layout"

vi.mock("next/font/google", () => ({
  Inter: () => ({ className: "mock-inter" }),
}))

vi.mock("@/app/providers", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}))

vi.mock("@/components/NavBar", () => ({
  default: () => <nav aria-label="Primary navigation">Navigation</nav>,
}))

describe("root layout", () => {
  it("provides the document shell around the active route", () => {
    const layout = RootLayout({
      children: <p>Route content</p>,
    }) as ReactElement<{
      lang: string
      className: string
      children: ReactElement<{ className: string }>
    }>
    const body = layout.props.children

    expect(layout.type).toBe("html")
    expect(layout.props.lang).toBe("en")
    expect(layout.props.className).toBe("mock-inter")
    expect(body.type).toBe("body")
    expect(body.props.className).toContain("bg-gray-100")
  })

  it("owns the document main landmark and navigation target", () => {
    render(
      RootLayout({
        children: <p>Route content</p>,
      }),
    )

    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content")
  })
})
