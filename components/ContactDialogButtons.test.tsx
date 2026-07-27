import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ContactDialogButtons from "@/components/ContactDialogButtons"
import { ContactDialogStep } from "@/contacts/CONTACT_DIALOG_STEPS"
import { DialogState } from "@/types/DialogState"

function renderButtons({
  dialogState = { type: "CREATE" },
  dialogStep = "email",
  validateStep = vi.fn().mockResolvedValue(true),
}: {
  dialogState?: DialogState
  dialogStep?: ContactDialogStep
  validateStep?: () => Promise<boolean>
} = {}) {
  const closeDialog = vi.fn()
  const showStep = vi.fn()
  const submitDialog = vi.fn()

  render(
    <ContactDialogButtons
      dialogState={dialogState}
      closeDialog={closeDialog}
      dialogStep={dialogStep}
      showStep={showStep}
      submitDialog={submitDialog}
      validateStep={validateStep}
    />,
  )

  return { closeDialog, showStep, submitDialog, validateStep }
}

describe("contact dialog navigation", () => {
  it("cancels a non-edit dialog from either action", () => {
    const { closeDialog, submitDialog, validateStep } = renderButtons({
      dialogState: {
        type: "DELETE",
        contact: { id: 1, firstName: "Ada", lastName: "Lovelace" },
      },
    })

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    fireEvent.click(screen.getByRole("button", { name: "Submit" }))

    expect(closeDialog).toHaveBeenCalledOnce()
    expect(submitDialog).toHaveBeenCalledOnce()
    expect(validateStep).not.toHaveBeenCalled()
  })

  it("moves from email to information after valid email input", async () => {
    const { closeDialog, showStep, validateStep } = renderButtons()

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => expect(showStep).toHaveBeenCalledWith("information"))
    expect(closeDialog).toHaveBeenCalledOnce()
    expect(validateStep).toHaveBeenCalledOnce()
  })

  it("returns to email and advances to review from information", async () => {
    const { showStep, validateStep } = renderButtons({
      dialogStep: "information",
    })

    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => expect(validateStep).toHaveBeenCalledOnce())
    expect(showStep).toHaveBeenNthCalledWith(1, "email")
    expect(showStep).toHaveBeenNthCalledWith(2, "review")
  })

  it("stays on the current information step when validation fails", async () => {
    const validateStep = vi.fn().mockResolvedValue(false)
    const { showStep } = renderButtons({
      dialogStep: "information",
      validateStep,
    })

    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => expect(validateStep).toHaveBeenCalledOnce())
    expect(showStep).not.toHaveBeenCalled()
  })

  it("submits directly from the review step", () => {
    const { showStep, submitDialog, validateStep } = renderButtons({
      dialogStep: "review",
    })

    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    fireEvent.click(screen.getByRole("button", { name: "Submit" }))

    expect(showStep).toHaveBeenCalledWith("information")
    expect(submitDialog).toHaveBeenCalledOnce()
    expect(validateStep).not.toHaveBeenCalled()
  })
})
