import { DialogState } from "@/components/ContactDialog"
import { Dialog } from "@headlessui/react"

export default function ContactDialogTitle({
  dialogState,
}: {
  dialogState: DialogState
}) {
  return (
    <Dialog.Title className="text-center text-2xl font-bold pb-4">
      {/** We transform the dialog state to title case: "Update" */}
      {`${dialogState.type.slice(0, 1)}${dialogState.type
        .slice(1)
        .toLocaleLowerCase()}`}{" "}
      {dialogState.type !== "RESET" && "Phone Book Entry"}
      {dialogState.type === "RESET" && "Contacts"}
    </Dialog.Title>
  )
}
