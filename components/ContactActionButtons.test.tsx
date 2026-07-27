import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ButtonCreate from "@/components/ButtonCreate"
import ButtonReset from "@/components/ButtonReset"

describe("contact action buttons", () => {
  it("opens the create dialog", () => {
    const setDialogState = vi.fn()
    render(<ButtonCreate setDialogState={setDialogState} />)

    fireEvent.click(screen.getByRole("button", { name: "+ Add Contact" }))

    expect(setDialogState).toHaveBeenCalledWith({ type: "CREATE" })
  })

  it("opens the reset confirmation dialog", () => {
    const setDialogState = vi.fn()
    render(<ButtonReset setDialogState={setDialogState} />)

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete all contacts and restore the demonstration contacts",
      }),
    )

    expect(setDialogState).toHaveBeenCalledWith({ type: "RESET" })
  })
})
