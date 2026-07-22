import { useRef } from "react"
import { Id, toast } from "react-toastify"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
import {
  buildContactFromFormValues,
  ContactFormValues,
} from "@/utils/contactForm"
import usePhoneBookService from "@/utils/usePhoneBookService"

export default function useOnDialogSubmit({
  dialogState,
  contacts,
  closeDialog,
}: {
  dialogState: DialogState
  contacts: Contact[]
  closeDialog: () => void
}) {
  const { send } = usePhoneBookService()
  const contactActionToastId = useRef<Id | undefined>(undefined)

  const showContactActionSuccess = (message: string) => {
    const currentToastId = contactActionToastId.current
    if (currentToastId !== undefined && toast.isActive(currentToastId)) {
      toast.update(currentToastId, { render: message, type: "success" })
      return
    }
    contactActionToastId.current = toast.success(message)
  }

  const onDialogSubmit = (formValues: ContactFormValues) => {
    if (dialogState.type === "CREATE") {
      const maxId = contacts.length
        ? Math.max(...contacts.map(({ id }) => id))
        : 0
      const contact = buildContactFromFormValues(formValues, {
        id: maxId + 1,
      })

      send({ type: "CREATE", contact })
      showContactActionSuccess("Contact created.")
    }

    if (dialogState.type === "UPDATE") {
      const oldContact = dialogState.contact
      const contact = buildContactFromFormValues(formValues, {
        id: oldContact.id,
        photo: oldContact.photo,
        isFavorite: oldContact.isFavorite,
      })

      send({ type: "UPDATE", contact })
      showContactActionSuccess("Contact updated.")
    }

    if (dialogState.type === "DELETE") {
      send({ type: "DELETE", contact: dialogState.contact })
      showContactActionSuccess("Contact deleted.")
    }

    if (dialogState.type === "RESET") {
      send({ type: "RESET" })
      showContactActionSuccess("Contacts reset.")
    }

    closeDialog()
  }

  return { onDialogSubmit }
}
