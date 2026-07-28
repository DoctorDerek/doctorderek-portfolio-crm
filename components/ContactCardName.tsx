import { PencilSquareIcon } from "@heroicons/react/24/outline"
import { Dispatch, SetStateAction } from "react"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"

export default function ContactCardNameAndCity({
  contact,
  setDialogState,
}: {
  contact: Contact
  setDialogState?: Dispatch<SetStateAction<DialogState>>
}) {
  const { firstName, lastName, city } = contact
  const contactName = `${firstName} ${lastName}`

  return (
    <div className="flex min-w-0 items-center gap-2">
      <h3 className="flex min-w-0 flex-col items-start justify-center">
        <span className="text-2xl leading-7 font-semibold tracking-widest uppercase">
          {contactName}
        </span>
        <span className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-300">
          {city}
        </span>
      </h3>
      {setDialogState && (
        <button
          type="button"
          aria-label={`Edit ${contactName}`}
          title={`Edit ${contactName}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-blue-950 dark:hover:text-blue-200"
          onClick={() => setDialogState({ type: "UPDATE", contact })}
        >
          <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
