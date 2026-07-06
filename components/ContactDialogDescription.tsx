import { DialogState } from "@/components/ContactDialog"
import { Dialog } from "@headlessui/react"

export default function ContactDialogDescription({
  dialogState,
}: {
  dialogState: DialogState
}) {
  return (
    <Dialog.Description>
      {dialogState.type === "CREATE" &&
        "This will create a new entry in your contacts."}
      {dialogState.type === "UPDATE" &&
        "This will update the entry in your contacts."}
      {dialogState.type === "DELETE" &&
        "This will permanently delete the entry."}
      {dialogState.type === "RESET" &&
        "This will permanently reset your contacts."}
    </Dialog.Description>
  )
}
