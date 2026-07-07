import { DialogState } from "@/types"
import { Dispatch, SetStateAction } from "react"

export default function ButtonCreate({
  setDialogState,
}: {
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  return (
    <button
      className="flex-shrink-0 whitespace-nowrap rounded-md bg-blue-400 px-6 py-2 text-white hover:bg-blue-500 hover:outline hover:outline-1 hover:outline-blue-400"
      onClick={() => setDialogState({ type: "CREATE" })}
    >
      + Add Contact
    </button>
  )
}
