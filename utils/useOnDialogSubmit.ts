import { useRef } from "react"
import { Id, toast } from "react-toastify"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
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

  const onDialogSubmit = (data: Contact) => {
    if (dialogState.type === "CREATE") {
      const {
        firstName,
        lastName,
        birthYear,
        birthMonth,
        birthDay,
        streetAddress,
        city,
        state,
        zipCode,
        phoneNumber,
        email,
      } = data

      const maxId = contacts?.length
        ? Math.max(...contacts.map(({ id }) => id))
        : 0

      const contact = {
        id: maxId + 1,
        firstName,
        lastName,
        birthYear,
        birthMonth,
        birthDay,
        streetAddress,
        city,
        state,
        zipCode,
        phoneNumber,
        email,
      }

      send({ type: "CREATE", contact })
      showContactActionSuccess("Contact created.")
    }

    if (dialogState.type === "UPDATE") {
      const oldContact = dialogState?.contact

      const firstName = data.firstName || oldContact?.firstName || ""
      const lastName = data.lastName || oldContact?.lastName || ""
      const birthYear = data.birthYear || oldContact?.birthYear || ""
      const birthMonth = data.birthMonth || oldContact?.birthMonth || ""
      const birthDay = data.birthDay || oldContact?.birthDay || ""
      const streetAddress =
        data.streetAddress || oldContact?.streetAddress || ""
      const city = data.city || oldContact?.city || ""
      const state = data.state || oldContact?.state || ""
      const zipCode = data.zipCode || oldContact?.zipCode || ""
      const phoneNumber = data.phoneNumber || oldContact?.phoneNumber || ""
      const email = data.email || oldContact?.email || ""
      const id = oldContact?.id || -1

      const photo = oldContact?.photo || ""
      const isFavorite = oldContact?.isFavorite

      const contact = {
        id,
        firstName,
        lastName,
        phoneNumber,
        birthYear,
        birthMonth,
        birthDay,
        photo,
        isFavorite,
        streetAddress,
        city,
        state,
        zipCode,
        email,
      }

      send({ type: "UPDATE", contact })
      showContactActionSuccess("Contact updated.")
    }

    if (dialogState.type === "DELETE" && dialogState?.contact) {
      send({ type: "DELETE", contact: dialogState?.contact })
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
