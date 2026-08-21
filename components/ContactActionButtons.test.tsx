import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ButtonCreate from "@/components/ButtonCreate"
import ButtonReset from "@/components/ButtonReset"

describe("contact action buttons", () => {
  it("opens the create dialog", () => {
    const setDialogState = vi.fn()
    render(<ButtonCreate setDialogState={setDialogState} />)

    const createButton = screen.getByRole("button", { name: "+ Add Contact" })

    expect(createButton).toHaveClass("bg-blue-600")
    fireEvent.click(createButton)

    expect(setDialogState).toHaveBeenCalledWith({ type: "CREATE" })
  })

  it("opens the reset confirmation dialog", () => {
    const setDialogState = vi.fn()
    render(<ButtonReset setDialogState={setDialogState} />)

    const resetButton = screen.getByRole("button", {
      name: "Reset contacts to the demonstration contacts",
    })

    expect(resetButton).toHaveClass("text-red-700")
    fireEvent.click(resetButton)

    expect(setDialogState).toHaveBeenCalledWith({ type: "RESET" })
  })
})
