import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ContactCardName from "@/components/ContactCardName"
import { Contact } from "@/types/Contact"

const contact: Contact = {
  id: 7,
  firstName: "Ada",
  lastName: "Lovelace",
  city: "London",
}

describe("contact card name", () => {
  it("renders read-only identity details without an edit action", () => {
    render(<ContactCardName contact={contact} />)

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
    expect(screen.getByText("London")).toHaveClass("text-gray-600")
    expect(
      screen.queryByRole("button", { name: "Edit Ada Lovelace" }),
    ).not.toBeInTheDocument()
  })

  it("opens the update dialog when editing is available", () => {
    const setDialogState = vi.fn()
    render(
      <ContactCardName contact={contact} setDialogState={setDialogState} />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Edit Ada Lovelace" }))

    expect(setDialogState).toHaveBeenCalledWith({
      type: "UPDATE",
      contact,
    })
  })
})
