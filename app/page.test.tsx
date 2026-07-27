import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Homepage from "@/app/page"

vi.mock("@/components/PhoneBookApp", () => ({
  default: () => <h1>Portfolio CRM</h1>,
}))

describe("homepage", () => {
  it("renders the portfolio CRM application entry point", () => {
    render(<Homepage />)

    expect(
      screen.getByRole("heading", { name: "Portfolio CRM" }),
    ).toBeInTheDocument()
  })
})
