import { fireEvent, render, screen } from "@testing-library/react"
import { toast } from "react-toastify"
import { afterEach, describe, expect, it, vi } from "vitest"
import Providers from "@/app/providers"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
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
}: {
  closeDialog: () => void
  dialogState: DialogState
}) {
  const { onDialogSubmit } = useOnDialogSubmit({
    closeDialog,
    contacts: [contact],
    dialogState,
  })

  return (
    <button onClick={() => onDialogSubmit(contact)} type="button">
      Complete contact action
    </button>
  )
}

describe("contact action notifications", () => {
  afterEach(() => {
    toast.dismiss()
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
})
