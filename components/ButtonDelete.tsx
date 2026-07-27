import { TrashIcon } from "@heroicons/react/24/solid"
import { Dispatch, SetStateAction } from "react"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"

export default function ButtonDelete({
  contact,
  setDialogState,
}: {
  contact: Contact
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  const { firstName, lastName, phoneNumber } = contact
  return (
    <button
      type="button"
      aria-label={`Delete ${firstName} ${lastName} ${phoneNumber}`}
      title={`Delete ${firstName} ${lastName}`}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-950 dark:hover:text-red-200"
      onClick={() => setDialogState({ type: "DELETE", contact })}
    >
      <TrashIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
