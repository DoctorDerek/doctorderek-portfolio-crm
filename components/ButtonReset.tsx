import { TrashIcon } from "@heroicons/react/24/solid"
import { Dispatch, SetStateAction } from "react"
import { DialogState } from "@/types/DialogState"

export default function ButtonReset({
  setDialogState,
}: {
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  return (
    <button
      type="button"
      aria-label="Reset contacts to the demonstration contacts"
      onClick={() => setDialogState({ type: "RESET" })}
      className="group flex min-h-10 items-center justify-center gap-2 rounded-md px-3 font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-950 dark:hover:text-red-200"
    >
      <TrashIcon aria-hidden="true" className="h-5 w-5" />
      Reset contacts
    </button>
  )
}
