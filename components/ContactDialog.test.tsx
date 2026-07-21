import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Providers from "@/app/providers"
import ContactDialog from "@/components/ContactDialog"

function renderCreateDialog() {
  render(
    <Providers>
      <ContactDialog
        contacts={[]}
        dialogState={{ type: "CREATE" }}
        setDialogState={vi.fn()}
      />
    </Providers>,
  )
}

async function showInformationStep() {
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
}

function fillContactInformation(birthDay: string) {
  const fieldValues = [
    ["First Name", "Ada"],
    ["Last Name", "Lovelace"],
    ["Date of Birth - Month", "02"],
    ["Date of Birth - Day", birthDay],
    ["Date of Birth - Year", "2000"],
    ["Phone Number", "555-0101"],
  ] as const

  for (const [label, value] of fieldValues) {
    fireEvent.change(screen.getByLabelText(label), {
      target: { value },
    })
  }
}

describe("contact dialog validation and review", () => {
  it("keeps an impossible birthday off the review step", async () => {
    renderCreateDialog()
    await showInformationStep()
    fillContactInformation("30")
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

  it("presents a valid contact as a read-only review confirmation", async () => {
    renderCreateDialog()
    await showInformationStep()
    fillContactInformation("29")
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(screen.getByText("Review").closest("li")).toHaveAttribute(
        "aria-current",
        "step",
      )
    })
    expect(screen.getByText("Review and Submit")).toBeInTheDocument()
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Edit Ada Lovelace" }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", {
        name: "Add Ada Lovelace to favorites",
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", {
        name: "Delete Ada Lovelace 555-0101",
      }),
    ).not.toBeInTheDocument()
  })
})
