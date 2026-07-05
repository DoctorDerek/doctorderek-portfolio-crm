import { DialogState } from "@/components/ContactDialog"
import { calculateAge, Contact } from "@/contacts/CONTACTS"
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
  // Retrieve our global context from the XState finite state machine:
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
          // Special header to demonstrate the response in the toast:
          "X-HttpStatus-Response-Contact": JSON.stringify(contact),
        },
        // We send the contact as JSON:
        body: JSON.stringify(contact),
      })
      // We toast the response as JSON:
      toast(JSON.stringify(await response.json()))
    },
  })

  const onDialogSubmit = (data: Contact) => {
    if (dialogState.type === "CREATE") {
      // We used React Hook Form to make sure we're getting all of the items:
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
      // We need the max id from the current contacts to avoid hash collisions.
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
        // The `age` is calculated by CREATE in `phoneBookMachine`.
      }

      // Send the contact to the `phoneBookMachine` to update `localStorage`.
      send({ type: "CREATE", contact })
      // Send the contact to the `mutation` to update the demonstration server.
      mutation.mutate(contact)
    }

    if (dialogState.type === "UPDATE") {
      /** We unpack the existing contact from the `dialogState`. */
      const oldContact = dialogState?.contact
      // We have values from the form OR the contact for each of the fields.
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
      // We preserve data we didn't update in the form so we don't overwrite it.
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

      // Send the contact to the `phoneBookMachine` to update `localStorage`.
      send({ type: "UPDATE", contact })
      // Send the contact to the `mutation` to update the demonstration server.
      mutation.mutate(contact)
    }

    if (dialogState.type === "DELETE" && dialogState?.contact)
      // We should have the entry from the dialog state, but data will be blank.
      send({ type: "DELETE", contact: dialogState?.contact })

    if (dialogState.type === "RESET") send({ type: "RESET" })

    // Close and reset the dialog once we've finished sending the action.
    closeDialog()
    // We handle flushing the state to `localStorage` in the `useEffect` hook.
  }

  return { onDialogSubmit }
}
