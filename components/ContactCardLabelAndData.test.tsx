import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ContactCardLabelAndData from "@/components/ContactCardLabelAndData"

describe("contact card label and data", () => {
  it("presents readable metadata", () => {
    render(<ContactCardLabelAndData label="Birthday" data="June 9, 1963" />)

    expect(screen.getByText("Birthday")).toHaveClass("text-gray-600")
    expect(screen.getByText("June 9, 1963")).toBeInTheDocument()
  })
})
