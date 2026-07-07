import { Contact } from "@/contacts/CONTACTS"
import { DialogState } from "@/types"
import { calculateAge } from "@/utils/calculateAge"
import usePhoneBookService from "@/utils/usePhoneBookService"
import { useMutation } from "react-query"
import { toast } from "react-toastify"

/**
 * This is our master form handler that handles all the action types.
 *
 * The `data` are the updated (or new) fields from the form.
 * The `dialogState.type` is the action that we want to take.
 * The `dialogState.contact` is the active (old) contact.
 */
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

  /**
   * Grab the mutation for https://httpstat.us/200 to demonstrate an API call.
   *
   * We include header "Accept: application/json" as part of the request. */
  const mutation = useMutation({
    mutationFn: async (contact: Contact) => {
      toast("Sending the contact to https://httpstat.us/200.")
      const response = await fetch("https://httpstat.us/200", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",

          "X-HttpStatus-Response-Contact": JSON.stringify(contact),
        },

        body: JSON.stringify(contact),
      })

      toast(JSON.stringify(await response.json()))
    },
  })

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

      const maxId = Math.max(...contacts?.map(({ id }) => id))

      /** This is the contact that's ready to send to the state machine. */
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

      mutation.mutate(contact)
    }

    if (dialogState.type === "UPDATE") {
      /** We unpack the existing contact from the `dialogState`. */
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
      /** The id should come from the existing entry, but we fall back to -1. */
      const id = oldContact?.id || -1

      const photo = oldContact?.photo || ""
      const age =
        oldContact?.age ||
        calculateAge({ birthYear, birthMonth, birthDay }) ||
        -1

      /** This is the contact that's ready to send to the state machine. */
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

      mutation.mutate(contact)
    }

    if (dialogState.type === "DELETE" && dialogState?.contact)
      send({ type: "DELETE", contact: dialogState?.contact })

    if (dialogState.type === "RESET") send({ type: "RESET" })

    closeDialog()
  }

  return { onDialogSubmit }
}
