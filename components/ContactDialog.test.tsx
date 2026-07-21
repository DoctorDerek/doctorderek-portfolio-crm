import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Providers from "@/app/providers"
import ContactDialog from "@/components/ContactDialog"

describe("contact dialog birthday validation", () => {
  it("keeps an impossible birthday off the review step", async () => {
    render(
      <Providers>
        <ContactDialog
          contacts={[]}
          dialogState={{ type: "CREATE" }}
          setDialogState={vi.fn()}
        />
      </Providers>,
    )

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "ada@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(screen.getByText("Info").closest("li")).toHaveAttribute(
        "aria-current",
        "step",
      )
    })

    const fieldValues = [
      ["First Name", "Ada"],
      ["Last Name", "Lovelace"],
      ["Date of Birth - Month", "02"],
      ["Date of Birth - Day", "30"],
      ["Date of Birth - Year", "2000"],
      ["Phone Number", "555-0101"],
    ] as const

    for (const [label, value] of fieldValues) {
      fireEvent.change(screen.getByLabelText(label), {
        target: { value },
      })
    }
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(
      await screen.findByText("Please enter a valid date of birth."),
    ).toBeInTheDocument()
    expect(screen.getByText("Info").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    )
    expect(screen.getByText("Review").closest("li")).not.toHaveAttribute(
      "aria-current",
    )
  })
})
