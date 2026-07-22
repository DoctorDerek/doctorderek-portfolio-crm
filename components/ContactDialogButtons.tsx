import { MouseEvent, ReactNode } from "react"
import {
  CONTACT_DIALOG_STEPS,
  ContactDialogStep,
} from "@/contacts/CONTACT_DIALOG_STEPS"
import { DialogState } from "@/types/DialogState"
import classNames from "@/utils/classNames"

function CheckMark() {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ProgressIndicator({
  dialogStep,
  step,
  children,
}: {
  dialogStep: ContactDialogStep
  step: ContactDialogStep
  children: ReactNode
}) {
  const currentStepIndex = CONTACT_DIALOG_STEPS.findIndex(
    ({ id }) => id === dialogStep,
  )
  const stepIndex = CONTACT_DIALOG_STEPS.findIndex(({ id }) => id === step)

  return (
    <li
      aria-current={dialogStep === step ? "step" : undefined}
      className={classNames(
        "flex items-center rounded-sm border border-solid pr-2",
        dialogStep === step
          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
          : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300",
      )}
    >
      <span className="flex h-6 w-6 items-center justify-end font-bold sm:h-8 sm:w-8">
        {currentStepIndex > stepIndex ? (
          <CheckMark />
        ) : (
          <span className="mr-2.5">{stepIndex + 1}</span>
        )}
      </span>
      {children}
    </li>
  )
}

function ProgressIndicators({ dialogStep }: { dialogStep: ContactDialogStep }) {
  return (
    <ol className="mt-4 flex w-full items-center justify-between text-center text-sm font-medium text-gray-500 sm:text-base dark:text-gray-400">
      {CONTACT_DIALOG_STEPS.map(({ id, label }) => (
        <ProgressIndicator key={id} dialogStep={dialogStep} step={id}>
          {label}
        </ProgressIndicator>
      ))}
    </ol>
  )
}

function ContactDialogButton({
  label,
  onClick,
  color,
}: {
  label: string
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  color:
    | "bg-blue-400 text-white hover:bg-blue-500 hover:outline-blue-400"
    | "bg-gray-800 text-white hover:bg-gray-700 hover:outline-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:outline-gray-700"
}) {
  return (
    <button
      type="button"
      className={classNames(
        "rounded-md px-6 py-2 hover:outline-1 hover:outline-solid",
        color,
      )}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default function ContactDialogButtons({
  dialogState,
  closeDialog,
  dialogStep,
  showStep,
  submitDialog,
  validateStep,
}: {
  dialogState: DialogState
  closeDialog: () => void
  dialogStep: ContactDialogStep
  showStep: (nextStep: ContactDialogStep) => void
  submitDialog: () => void
  validateStep: () => Promise<boolean>
}) {
  const handleBack = () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE") {
      closeDialog()
      return
    }
    if (dialogStep === "email") {
      closeDialog()
      return
    }
    showStep(dialogStep === "review" ? "information" : "email")
  }
  const getBackLabel = () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE")
      return "Cancel"
    if (dialogStep === "email") return "Cancel"
    return "Back"
  }
  const handleNext = async () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE") return
    if (dialogStep === "review") return
    const isCurrentStepValid = await validateStep()
    if (!isCurrentStepValid) return
    showStep(dialogStep === "email" ? "information" : "review")
  }
  const getNextLabel = () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE")
      return "Submit"
    if (dialogStep === "review") return "Submit"
    return "Next"
  }
  return (
    <>
      <div className="flex w-full items-center justify-between space-x-2">
        <ContactDialogButton
          label={getBackLabel()}
          color="bg-gray-800 text-white hover:bg-gray-700 hover:outline-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:outline-gray-700"
          onClick={handleBack}
        />
        <ContactDialogButton
          label={getNextLabel()}
          color="bg-blue-400 text-white hover:bg-blue-500 hover:outline-blue-400"
          onClick={
            (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE") ||
            dialogStep === "review"
              ? (event) => {
                  event.preventDefault()
                  submitDialog()
                }
              : (event) => {
                  event.preventDefault()
                  void handleNext()
                }
          }
        />
      </div>
      {(dialogState.type === "CREATE" || dialogState.type === "UPDATE") && (
        <ProgressIndicators dialogStep={dialogStep} />
      )}
    </>
  )
}
