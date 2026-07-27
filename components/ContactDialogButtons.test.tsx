import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ContactDialogButtons from "@/components/ContactDialogButtons"
import { ContactDialogStep } from "@/contacts/CONTACT_DIALOG_STEPS"
import { DialogState } from "@/types/DialogState"

function renderButtons({
  dialogState = { type: "CREATE" },
  dialogStep = "information",
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

  it("moves from information to review after valid form input", async () => {
    const { closeDialog, showStep, validateStep } = renderButtons()

    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => expect(showStep).toHaveBeenCalledWith("review"))
    expect(closeDialog).not.toHaveBeenCalled()
    expect(validateStep).toHaveBeenCalledOnce()
  })

  it("cancels the first form step without validation", () => {
    const { closeDialog, showStep, validateStep } = renderButtons()

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))

    expect(closeDialog).toHaveBeenCalledOnce()
    expect(showStep).not.toHaveBeenCalled()
    expect(validateStep).not.toHaveBeenCalled()
  })

  it("returns to information and advances to review", async () => {
    const { showStep, validateStep } = renderButtons({
      dialogStep: "review",
    })

    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => expect(validateStep).toHaveBeenCalledOnce())
    expect(showStep).toHaveBeenNthCalledWith(1, "information")
    expect(showStep).toHaveBeenNthCalledWith(2, "review")
  })

  it("renders exactly two progress indicators", () => {
    renderButtons()

    expect(screen.getByRole("list").querySelectorAll("li")).toHaveLength(2)
    expect(screen.getByText("Contact information")).toBeInTheDocument()
    expect(screen.getByText("Review")).toBeInTheDocument()
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
