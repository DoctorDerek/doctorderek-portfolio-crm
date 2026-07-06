import { DialogState } from "@/types"
import { Contact } from "@/types"
import { Dispatch, SetStateAction } from "react"

/** This component includes the `edit` button to UPDATE the contact. */
export default function ContactCardNameAndCity({
  contact,
  setDialogState,
}: {
  contact: Contact
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  const { firstName, lastName, city } = contact || {
    firstName: "",
    lastName: "",
    city: "",
  }
  return (
    <h3 className="flex flex-col items-start justify-center">
      <button
        className="group flex items-center justify-center text-left text-2xl font-semibold uppercase leading-7 tracking-widest"
        // We have to reapply the UPPERCASE style here because it's overridden.
        onClick={() => setDialogState({ type: "UPDATE", contact })}
      >
        {firstName} {lastName}
        <div className="invisible pl-1 text-sm lowercase tracking-normal text-gray-400 group-hover:visible dark:text-gray-300">
          edit
        </div>
      </button>
      <span className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-300">
        {city}
      </span>
    </h3>
  )
}
