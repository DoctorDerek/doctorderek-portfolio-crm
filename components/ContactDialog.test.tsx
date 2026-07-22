import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Providers from "@/app/providers"
import ContactDialog from "@/components/ContactDialog"
import { Contact } from "@/types/Contact"

const existingContact: Contact = {
  id: 7,
  firstName: "Ada",
  lastName: "Lovelace",
  birthYear: "1815",
  birthMonth: "12",
  birthDay: "10",
  streetAddress: "17 Analytical Engine Way",
  city: "London",
  state: "England",
  zipCode: "W1",
  phoneNumber: "555-1815",
  email: "ada@example.com",
  isFavorite: true,
}

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

function renderUpdateDialog() {
  const setDialogState = vi.fn()

  render(
    <Providers>
      <ContactDialog
        contacts={[existingContact]}
        dialogState={{ type: "UPDATE", contact: existingContact }}
        setDialogState={setDialogState}
      />
    </Providers>,
  )

  return setDialogState
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

  it("reviews untouched update values exactly as they are stored", async () => {
    renderUpdateDialog()

    expect(screen.getByLabelText("Email Address")).toHaveValue(
      existingContact.email,
    )
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(screen.getByText("Info").closest("li")).toHaveAttribute(
        "aria-current",
        "step",
      )
    })
    expect(screen.getByLabelText("First Name")).toHaveValue(
      existingContact.firstName,
    )
    expect(screen.getByLabelText("Last Name")).toHaveValue(
      existingContact.lastName,
    )
    expect(screen.getByLabelText("Street Address")).toHaveValue(
      existingContact.streetAddress,
    )
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true")

    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument()
    expect(screen.getByText("December 10, 1815")).toBeInTheDocument()
    expect(screen.getByText("17 Analytical Engine Way")).toBeInTheDocument()
    expect(screen.getByText("555-1815")).toBeInTheDocument()
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === "DIV" &&
          element.textContent === "ada@example.com",
      ),
    ).toBeInTheDocument()
  })

  it("applies the same email and birthday validation to updates", async () => {
    renderUpdateDialog()

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "not-an-email" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument()
    expect(screen.getByText("Email").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    )

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: existingContact.email },
    })
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    await waitFor(() => {
      expect(screen.getByText("Info").closest("li")).toHaveAttribute(
        "aria-current",
        "step",
      )
    })

    fireEvent.change(screen.getByLabelText("Date of Birth - Month"), {
      target: { value: "02" },
    })
    fireEvent.change(screen.getByLabelText("Date of Birth - Day"), {
      target: { value: "30" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(
      await screen.findByText("Please enter a valid date of birth."),
    ).toBeInTheDocument()
    expect(screen.getByText("Info").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    )
  })

  it("clears optional update values while preserving hidden address inputs", async () => {
    const setDialogState = renderUpdateDialog()

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    await waitFor(() => {
      expect(screen.getByText("Info").closest("li")).toHaveAttribute(
        "aria-current",
        "step",
      )
    })

    for (const label of [
      "Date of Birth - Month",
      "Date of Birth - Day",
      "Date of Birth - Year",
      "Phone Number",
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value: "" } })
    }
    fireEvent.click(screen.getByRole("switch"))

    expect(screen.getByLabelText("Street Address")).toBeDisabled()
    expect(screen.getByLabelText("Street Address")).toHaveValue(
      existingContact.streetAddress,
    )
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await screen.findByText("Review and Submit")
    expect(
      screen.queryByText(existingContact.streetAddress ?? ""),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(existingContact.phoneNumber ?? ""),
    ).not.toBeInTheDocument()
    expect(screen.queryByText("December 10, 1815")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Submit" }))

    await waitFor(() => {
      expect(setDialogState).toHaveBeenCalledWith({ type: "CLOSED" })
    })
  })
})
