import { Contact } from "@/contacts/CONTACTS"
import { DialogState } from "@/types"
import { calculateAge } from "@/utils/calculateAge"
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
      const age =
        oldContact?.age ||
        calculateAge({ birthYear, birthMonth, birthDay }) ||
        -1

      const contact = {
        id,
        firstName,
        lastName,
        phoneNumber,
        birthYear,
        birthMonth,
        birthDay,
        age,
        photo,
        streetAddress,
        city,
        state,
        zipCode,
        email,
      }

      send({ type: "UPDATE", contact })
    }

    if (dialogState.type === "DELETE" && dialogState?.contact)
      send({ type: "DELETE", contact: dialogState?.contact })

    if (dialogState.type === "RESET") send({ type: "RESET" })

    closeDialog()
  }

  return { onDialogSubmit }
}
