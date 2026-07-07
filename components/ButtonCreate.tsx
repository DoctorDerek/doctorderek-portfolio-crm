import { DialogState } from "@/types"
import { Dispatch, SetStateAction } from "react"

export default function ButtonCreate({
  setDialogState,
}: {
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  return (
    <button
      className="shrink-0 rounded-md bg-blue-400 px-6 py-2 whitespace-nowrap text-white hover:bg-blue-500 hover:outline-1 hover:outline-blue-400 hover:outline-solid"
      onClick={() => setDialogState({ type: "CREATE" })}
    >
      + Add Contact
    </button>
  )
}
