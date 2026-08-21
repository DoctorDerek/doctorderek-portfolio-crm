import { Dispatch, SetStateAction } from "react"
import { DialogState } from "@/types/DialogState"

export default function ButtonCreate({
  setDialogState,
}: {
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  return (
    <button
      type="button"
      className="shrink-0 rounded-md bg-blue-600 px-6 py-2 whitespace-nowrap text-white hover:bg-blue-700 hover:outline-1 hover:outline-blue-600 hover:outline-solid"
      onClick={() => setDialogState({ type: "CREATE" })}
    >
      + Add Contact
    </button>
  )
}
