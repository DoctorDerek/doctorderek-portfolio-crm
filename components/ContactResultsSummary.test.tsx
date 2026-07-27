import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ContactResultsSummary from "@/components/ContactResultsSummary"

describe("contact results summary", () => {
  it("uses the singular contact label for one saved contact", () => {
    render(
      <ContactResultsSummary filteredContactCount={1} totalContactCount={1} />,
    )

    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 1 of 1 contact",
    )
  })

  it("uses the plural contact label for multiple saved contacts", () => {
    render(
      <ContactResultsSummary filteredContactCount={2} totalContactCount={3} />,
    )

    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 2 of 3 contacts",
    )
  })
})
