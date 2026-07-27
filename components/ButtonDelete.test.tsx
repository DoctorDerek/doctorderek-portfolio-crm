import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ButtonDelete from "@/components/ButtonDelete"
import { Contact } from "@/types/Contact"

const contact: Contact = {
  id: 7,
  firstName: "Ada",
  lastName: "Lovelace",
  phoneNumber: "555-0101",
}

describe("delete contact button", () => {
  it("opens the delete confirmation dialog for the selected contact", () => {
    const setDialogState = vi.fn()
    render(<ButtonDelete contact={contact} setDialogState={setDialogState} />)

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete Ada Lovelace 555-0101",
      }),
    )

    expect(setDialogState).toHaveBeenCalledWith({
      type: "DELETE",
      contact,
    })
  })
})
