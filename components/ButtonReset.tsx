import { DialogState } from "@/types"
import { TrashIcon } from "@heroicons/react/24/solid"
import { Dispatch, SetStateAction } from "react"

export default function ButtonReset({
  setDialogState,
}: {
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  return (
    <button
      onClick={() => setDialogState({ type: "RESET" })}
      className="group flex items-center justify-center"
    >
      <TrashIcon
        aria-label="Delete all phone book entries and reset"
        className="h-6 w-6 rounded-md group-hover:fill-red-600 group-hover:outline-1 group-hover:outline-red-600 group-hover:outline-solid"
      />
      <div className="invisible pl-1 font-bold text-red-600 group-hover:visible">
        reset
      </div>
    </button>
  )
}
