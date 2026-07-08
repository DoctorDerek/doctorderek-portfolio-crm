import { Dialog } from "@headlessui/react"
import { DialogState } from "@/types"

export default function ContactDialogTitle({
  dialogState,
}: {
  dialogState: DialogState
}) {
  return (
    <Dialog.Title className="pb-4 text-center text-2xl font-bold">
      {/** We transform the dialog state to title case: "Update" */}
      {`${dialogState.type.slice(0, 1)}${dialogState.type
        .slice(1)
        .toLocaleLowerCase()}`}{" "}
      {dialogState.type !== "RESET" && "Phone Book Entry"}
      {dialogState.type === "RESET" && "Contacts"}
    </Dialog.Title>
  )
}
