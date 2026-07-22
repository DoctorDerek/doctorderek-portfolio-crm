import { fireEvent, render, screen } from "@testing-library/react"
import { toast } from "react-toastify"
import { afterEach, describe, expect, it, vi } from "vitest"
import Providers from "@/app/providers"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
import { ContactFormValues } from "@/utils/contactForm"
import useOnDialogSubmit from "@/utils/useOnDialogSubmit"

const { send } = vi.hoisted(() => ({
  send: vi.fn(),
}))

vi.mock("@/utils/usePhoneBookService", () => ({
  default: () => ({ send }),
}))

const contact: Contact = {
  id: 1,
  firstName: "Jessica",
  lastName: "Christian",
  birthYear: "2022",
  birthMonth: "05",
  birthDay: "30",
  streetAddress: "1234 Main St",
  city: "San Francisco",
  state: "CA",
  zipCode: "94111",
  phoneNumber: "555-555-5555",
  email: "Jessica.Christian@example.com",
}

const contactFormValues: ContactFormValues = {
  firstName: contact.firstName,
  lastName: contact.lastName,
  birthYear: contact.birthYear ?? "",
  birthMonth: contact.birthMonth ?? "",
  birthDay: contact.birthDay ?? "",
  streetAddress: contact.streetAddress ?? "",
  city: contact.city ?? "",
  state: contact.state ?? "",
  zipCode: contact.zipCode ?? "",
  phoneNumber: contact.phoneNumber ?? "",
  email: contact.email ?? "",
  addressEnabled: true,
}

type ContactActionType = Exclude<DialogState["type"], "CLOSED">

const contactActionTestCases: {
  dialogState: DialogState
  eventType: ContactActionType
  notification: string
}[] = [
  {
    dialogState: { type: "CREATE" },
    eventType: "CREATE",
    notification: "Contact created.",
  },
  {
    dialogState: { type: "UPDATE", contact },
    eventType: "UPDATE",
    notification: "Contact updated.",
  },
  {
    dialogState: { type: "DELETE", contact },
    eventType: "DELETE",
    notification: "Contact deleted.",
  },
  {
    dialogState: { type: "RESET" },
    eventType: "RESET",
    notification: "Contacts reset.",
  },
]

function ContactActionHarness({
  closeDialog,
  dialogState,
  formValues = contactFormValues,
}: {
  closeDialog: () => void
  dialogState: DialogState
  formValues?: ContactFormValues
}) {
  const { onDialogSubmit } = useOnDialogSubmit({
    closeDialog,
    contacts: [contact],
    dialogState,
  })

  return (
    <button onClick={() => onDialogSubmit(formValues)} type="button">
      Complete contact action
    </button>
  )
}

describe("contact action notifications", () => {
  afterEach(() => {
    toast.dismiss()
    toast.clearWaitingQueue()
    send.mockReset()
  })

  it.each(contactActionTestCases)(
    "announces a successful $eventType action",
    async ({ dialogState, eventType, notification }) => {
      const closeDialog = vi.fn()

      render(
        <Providers>
          <ContactActionHarness
            closeDialog={closeDialog}
            dialogState={dialogState}
          />
        </Providers>,
      )

      fireEvent.click(
        screen.getByRole("button", { name: "Complete contact action" }),
      )

      expect(send).toHaveBeenCalledTimes(1)
      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({ type: eventType }),
      )
      expect(await screen.findByRole("alert")).toHaveTextContent(notification)
      expect(closeDialog).toHaveBeenCalledTimes(1)
    },
  )

  it("leaves updated age derivation to the state machine", () => {
    render(
      <Providers>
        <ContactActionHarness
          closeDialog={vi.fn()}
          dialogState={{
            type: "UPDATE",
            contact: { ...contact, age: 99 },
          }}
        />
      </Providers>,
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Complete contact action" }),
    )

    const updateEvent = send.mock.calls[0]?.[0]
    expect(updateEvent).toEqual(expect.objectContaining({ type: "UPDATE" }))
    expect(updateEvent.contact).not.toHaveProperty("age")
  })

  it("clears optional update values without replacing immutable metadata", () => {
    const existingContact = {
      ...contact,
      photo: "jessica.png",
      isFavorite: true,
    }

    render(
      <Providers>
        <ContactActionHarness
          closeDialog={vi.fn()}
          dialogState={{ type: "UPDATE", contact: existingContact }}
          formValues={{
            ...contactFormValues,
            firstName: "  Jessica  ",
            lastName: "  Christian  ",
            birthYear: "",
            birthMonth: "",
            birthDay: "",
            phoneNumber: "",
            email: "",
            addressEnabled: false,
          }}
        />
      </Providers>,
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Complete contact action" }),
    )

    expect(send).toHaveBeenCalledWith({
      type: "UPDATE",
      contact: {
        id: existingContact.id,
        firstName: "Jessica",
        lastName: "Christian",
        birthYear: undefined,
        birthMonth: undefined,
        birthDay: undefined,
        phoneNumber: undefined,
        email: undefined,
        photo: existingContact.photo,
        isFavorite: true,
      },
    })
  })

  it("replaces obsolete feedback during a rapid contact lifecycle", async () => {
    const closeDialog = vi.fn()
    const renderHarness = (dialogState: DialogState) => (
      <Providers>
        <ContactActionHarness
          closeDialog={closeDialog}
          dialogState={dialogState}
        />
      </Providers>
    )
    const { rerender } = render(renderHarness({ type: "CREATE" }))

    for (const { dialogState } of contactActionTestCases) {
      rerender(renderHarness(dialogState))
      fireEvent.click(
        screen.getByRole("button", { name: "Complete contact action" }),
      )
    }

    expect(await screen.findByText("Contacts reset.")).toBeInTheDocument()
    expect(screen.getAllByRole("alert")).toHaveLength(1)
    expect(send.mock.calls.map(([event]) => event.type)).toEqual([
      "CREATE",
      "UPDATE",
      "DELETE",
      "RESET",
    ])
    expect(closeDialog).toHaveBeenCalledTimes(4)
  })
})
