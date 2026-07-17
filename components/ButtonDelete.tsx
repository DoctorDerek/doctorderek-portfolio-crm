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
  const { firstName, lastName, phoneNumber } = contact || {
    firstName: "",
    lastName: "",
    phoneNumber: "",
  }
  return (
    <button
      className="group relative flex items-center justify-center"
      onClick={() => setDialogState({ type: "DELETE", contact })}
    >
      <div className="invisible absolute top-14 pr-1 text-sm font-bold text-red-600 group-hover:visible">
        delete
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500">
        <TrashIcon
          className="h-4 w-4 fill-white"
          aria-label={`Delete ${firstName} ${lastName} ${phoneNumber}`}
        />
      </div>
    </button>
  )
}
