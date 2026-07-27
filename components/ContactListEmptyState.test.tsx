import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ContactListEmptyState from "@/components/ContactListEmptyState"

describe("contact list empty state", () => {
  it("explains how to clear filters when contacts exist", () => {
    render(<ContactListEmptyState hasContacts />)

    expect(
      screen.getByRole("heading", { name: "No matching contacts" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Adjust or clear the active filters to see more contacts.",
      ),
    ).toBeInTheDocument()
  })

  it("invites the first contact when the address book is empty", () => {
    render(<ContactListEmptyState hasContacts={false} />)

    expect(
      screen.getByRole("heading", { name: "No contacts yet" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Create a contact to begin building your local portfolio CRM.",
      ),
    ).toBeInTheDocument()
  })
})
