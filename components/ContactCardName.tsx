import { Contact, DialogState } from "@/types"
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
        className="group flex items-center justify-center text-left text-2xl leading-7 font-semibold tracking-widest uppercase"

        onClick={() => setDialogState({ type: "UPDATE", contact })}
      >
        {firstName} {lastName}
        <div className="invisible pl-1 text-sm tracking-normal text-gray-400 lowercase group-hover:visible dark:text-gray-300">
          edit
        </div>
      </button>
      <span className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-300">
        {city}
      </span>
    </h3>
  )
}
