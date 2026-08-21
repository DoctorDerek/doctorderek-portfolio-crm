import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import Providers from "@/app/providers"
import NavBar from "@/components/NavBar"

vi.mock("@/components/ReactConfetti", () => ({
  default: () => <div aria-hidden="true" />,
}))

function renderNavigation() {
  return render(
    <Providers>
      <NavBar />
      <section id="filter" tabIndex={-1} />
    </Providers>,
  )
}

describe("navigation", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("reserves theme toggle geometry while its adapter loads", () => {
    const { container } = renderNavigation()
    const placeholder = container.querySelector('nav [aria-hidden="true"].w-28')

    expect(placeholder).toHaveClass("p-1", "sm:w-36")
    expect(placeholder?.firstElementChild).toHaveClass(
      "aspect-[17/7]",
      "w-full",
    )
  })

  it("opens the accessible mobile menu and closes it after navigation", async () => {
    renderNavigation()

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "#main-content",
    )
    expect(screen.getByText("CRM by @DoctorDerek")).toBeInTheDocument()
    expect(screen.getByText("by @DoctorDerek")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Filter" })).toHaveAttribute(
      "href",
      "#filter",
    )

    const openNavigationButton = screen.getByRole("button", {
      name: "Open navigation",
    })
    expect(openNavigationButton).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(openNavigationButton)

    const navigationDialog = await screen.findByRole("dialog", {
      name: "Navigation",
    })
    expect(openNavigationButton).toHaveAttribute("aria-expanded", "true")

    const mobileFilterLink = within(navigationDialog).getByRole("link", {
      name: "Filter",
    })
    expect(mobileFilterLink).toHaveAttribute("href", "#filter")
    fireEvent.click(mobileFilterLink)

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Navigation" }),
      ).not.toBeInTheDocument()
    })
    expect(openNavigationButton).toHaveAttribute("aria-expanded", "false")
  })

  it("dismisses the mobile menu with Escape", async () => {
    renderNavigation()

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }))
    expect(
      await screen.findByRole("dialog", { name: "Navigation" }),
    ).toBeInTheDocument()

    fireEvent.keyDown(document, { key: "Escape" })

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Navigation" }),
      ).not.toBeInTheDocument()
    })
  })
})
