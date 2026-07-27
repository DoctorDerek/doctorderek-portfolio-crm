import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Providers from "@/app/providers"
import ContactDialog from "@/components/ContactDialog"
import { Contact } from "@/types/Contact"

let shouldReduceMotion = false

vi.mock("motion/react", async () => {
  const actual =
    await vi.importActual<typeof import("motion/react")>("motion/react")
  return {
    ...actual,
    useReducedMotion: () => shouldReduceMotion,
  }
})

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

const alternateContact: Contact = {
  id: 8,
  firstName: "Alan",
  lastName: "Turing",
  birthYear: "1912",
  birthMonth: "06",
  birthDay: "23",
  streetAddress: "Main Street",
  city: "London",
  state: "England",
  zipCode: "WC1",
  phoneNumber: "555-1122",
  email: "alan@example.com",
  isFavorite: false,
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

function renderUpdateDialog(contact = existingContact) {
  const setDialogState = vi.fn()

  render(
    <Providers>
      <ContactDialog
        contacts={[existingContact]}
        dialogState={{ type: "UPDATE", contact }}
        setDialogState={setDialogState}
      />
    </Providers>,
  )

  return setDialogState
}

async function expectInformationStep() {
  expect(
    await screen.findByRole("region", { name: "Contact information" }),
  ).toBeInTheDocument()
  expect(screen.getByLabelText("Email Address")).toBeInTheDocument()
  expect(
    screen.getByRole("list").querySelector('[aria-current="step"]'),
  ).toHaveTextContent("Contact information")
}

async function expectReviewStep() {
  expect(
    await screen.findByRole("region", { name: "Review and Submit" }),
  ).toBeInTheDocument()
  expect(screen.getByText("Review").closest("li")).toHaveAttribute(
    "aria-current",
    "step",
  )
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
    await expectInformationStep()
    fillContactInformation("30")
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(
      await screen.findByText("Please enter a valid date of birth."),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("list").querySelector('[aria-current="step"]'),
    ).toHaveTextContent("Contact information")
    expect(screen.getByText("Review").closest("li")).not.toHaveAttribute(
      "aria-current",
    )
  })

  it("presents a valid contact as a read-only review confirmation", async () => {
    renderCreateDialog()
    await expectInformationStep()
    fillContactInformation("29")
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    await expectReviewStep()
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

  it("preserves form values across backward and forward step transitions", async () => {
    renderCreateDialog()
    await expectInformationStep()
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "ada@example.com" },
    })
    fillContactInformation("29")

    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    await expectReviewStep()
    fireEvent.click(screen.getByRole("button", { name: "Back" }))

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: "Contact information" }),
      ).toBeInTheDocument()
    })
    expect(screen.getByLabelText("Email Address")).toHaveValue(
      "ada@example.com",
    )

    expect(screen.getByLabelText("First Name")).toHaveValue("Ada")
    expect(screen.getByLabelText("Last Name")).toHaveValue("Lovelace")
    expect(screen.getByLabelText("Date of Birth - Day")).toHaveValue("29")
  })

  it("resets defaults when switching update targets", async () => {
    const { rerender, getByLabelText } = render(
      <Providers>
        <ContactDialog
          contacts={[existingContact, alternateContact]}
          dialogState={{ type: "UPDATE", contact: existingContact }}
          setDialogState={vi.fn()}
        />
      </Providers>,
    )

    expect(getByLabelText("Email Address")).toHaveValue(existingContact.email)
    expect(getByLabelText("First Name")).toHaveValue(existingContact.firstName)

    rerender(
      <Providers>
        <ContactDialog
          contacts={[existingContact, alternateContact]}
          dialogState={{ type: "UPDATE", contact: alternateContact }}
          setDialogState={vi.fn()}
        />
      </Providers>,
    )

    expect(screen.getByLabelText("First Name")).toHaveValue(
      alternateContact.firstName,
    )
    await expectInformationStep()
    expect(screen.getByLabelText("Email Address")).toHaveValue(
      alternateContact.email,
    )
    expect(
      screen.getByRole("list").querySelector('[aria-current="step"]'),
    ).toHaveTextContent("Contact information")
    expect(screen.getByLabelText("First Name")).toHaveValue(
      alternateContact.firstName,
    )
  })

  it("reviews untouched update values exactly as they are stored", async () => {
    renderUpdateDialog()

    expect(screen.getByLabelText("Email Address")).toHaveValue(
      existingContact.email,
    )
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
    expect(
      screen.getByRole("list").querySelector('[aria-current="step"]'),
    ).toHaveTextContent("Contact information")

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: existingContact.email },
    })
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    await expectReviewStep()

    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    await expectInformationStep()

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
    expect(
      screen.getByRole("list").querySelector('[aria-current="step"]'),
    ).toHaveTextContent("Contact information")
  })

  it("returns to the information step when native submission finds an email error", async () => {
    renderCreateDialog()
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "not-an-email" },
    })

    const form = screen.getByRole("dialog").querySelector("form")
    expect(form).not.toBeNull()
    fireEvent.submit(form as HTMLFormElement)

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("list").querySelector('[aria-current="step"]'),
    ).toHaveTextContent("Contact information")
  })

  it("renders the reduced-motion dialog transition path", async () => {
    shouldReduceMotion = true

    try {
      renderCreateDialog()
      await expectInformationStep()
      expect(
        screen.getByRole("region", { name: "Contact information" }),
      ).toBeInTheDocument()
    } finally {
      shouldReduceMotion = false
    }
  })

  it("validates a nonblank phone number during creation", async () => {
    renderCreateDialog()
    await expectInformationStep()
    fillContactInformation("29")
    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: "invalid phone" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(
      await screen.findByText("Please enter a valid phone number."),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("list").querySelector('[aria-current="step"]'),
    ).toHaveTextContent("Contact information")
  })

  it("clears optional update values while preserving hidden address inputs", async () => {
    const setDialogState = renderUpdateDialog()

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "" },
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

  it.each([
    {
      dialogState: { type: "DELETE", contact: existingContact } as const,
      notification: "Contact deleted.",
    },
    {
      dialogState: { type: "RESET" } as const,
      notification: "Contacts reset.",
    },
  ])(
    "submits $dialogState.type confirmations without form validation",
    async ({ dialogState, notification }) => {
      const setDialogState = vi.fn()
      render(
        <Providers>
          <ContactDialog
            contacts={[existingContact]}
            dialogState={dialogState}
            setDialogState={setDialogState}
          />
        </Providers>,
      )

      fireEvent.click(screen.getByRole("button", { name: "Submit" }))

      expect(await screen.findByRole("alert")).toHaveTextContent(notification)
      expect(setDialogState).toHaveBeenCalledWith({ type: "CLOSED" })
    },
  )
})
