import { DialogState } from "@/components/ContactDialog"

export default function ContactDialogWarning({
  dialogState,
}: {
  dialogState: DialogState
}) {
  return (
    <>
      {(dialogState.type === "DELETE" || dialogState.type === "RESET") && (
        <p>
          Are you sure you want to proceed? Your data will be permanently
          removed. This action cannot be undone.
        </p>
      )}
    </>
  )
}
