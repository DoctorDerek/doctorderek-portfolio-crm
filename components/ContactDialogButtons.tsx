import { MouseEvent, ReactNode } from "react"
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
  slideIndex,
  thisSlideIndex,
  children,
}: {
  slideIndex: number
  thisSlideIndex: number
  children: ReactNode
}) {
  return (
    <li
      aria-current={slideIndex === thisSlideIndex ? "step" : undefined}
      className={classNames(
        "flex items-center rounded-sm border border-solid pr-2",
        slideIndex === thisSlideIndex
          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
          : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300",
      )}
    >
      <span className="flex h-6 w-6 items-center justify-end font-bold sm:h-8 sm:w-8">
        {slideIndex > thisSlideIndex ? (
          <CheckMark />
        ) : (
          <span className="mr-2.5">{thisSlideIndex + 1}</span>
        )}
      </span>
      {children}
    </li>
  )
}

function ProgressIndicators({ slideIndex }: { slideIndex: number }) {
  return (
    <ol className="mt-4 flex w-full items-center justify-between text-center text-sm font-medium text-gray-500 sm:text-base dark:text-gray-400">
      <ProgressIndicator slideIndex={slideIndex} thisSlideIndex={0}>
        Email
      </ProgressIndicator>
      <ProgressIndicator slideIndex={slideIndex} thisSlideIndex={1}>
        Info
      </ProgressIndicator>
      <ProgressIndicator slideIndex={slideIndex} thisSlideIndex={2}>
        Review
      </ProgressIndicator>
    </ol>
  )
}

function ContactDialogButton({
  type,
  label,
  onClick,
  color,
}: {
  type: "button" | "submit"
  label: string
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  color:
    | "bg-blue-400 text-white hover:bg-blue-500 hover:outline-blue-400"
    | "bg-gray-800 text-white hover:bg-gray-700 hover:outline-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:outline-gray-700"
}) {
  return (
    <button
      type={type}
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
  slideIndex,
  showSlide,
  validateSlide,
}: {
  dialogState: DialogState
  closeDialog: () => void
  slideIndex: number
  showSlide: (nextSlideIndex: number) => void
  validateSlide: () => Promise<boolean>
}) {
  const maxIndex = 2
  const handleBack = () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE") {
      closeDialog()
      return
    }
    if (slideIndex === 0) {
      closeDialog()
      return
    }
    showSlide(slideIndex - 1)
  }
  const getBackLabel = () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE")
      return "Cancel"
    if (slideIndex === 0) return "Cancel"
    return "Back"
  }
  const getNextButtonType = () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE")
      return "submit"
    if (slideIndex === maxIndex) return "submit"
    return "button"
  }
  const handleNext = async () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE") return
    if (slideIndex === maxIndex) return
    const isCurrentSlideValid = await validateSlide()
    if (!isCurrentSlideValid) return
    showSlide(slideIndex + 1)
  }
  const getNextLabel = () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE")
      return "Submit"
    if (slideIndex === maxIndex) return "Submit"
    return "Next"
  }
  return (
    <>
      <div className="flex w-full items-center justify-between space-x-2">
        <ContactDialogButton
          type="button"
          label={getBackLabel()}
          color="bg-gray-800 text-white hover:bg-gray-700 hover:outline-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:outline-gray-700"
          onClick={handleBack}
        />
        <ContactDialogButton
          type={getNextButtonType()}
          label={getNextLabel()}
          color="bg-blue-400 text-white hover:bg-blue-500 hover:outline-blue-400"
          onClick={
            dialogState.type !== "CREATE" && dialogState.type !== "UPDATE"
              ? undefined
              : slideIndex === maxIndex
                ? undefined
                : (event) => {
                    event.preventDefault()
                    void handleNext()
                  }
          }
        />
      </div>
      {(dialogState.type === "CREATE" || dialogState.type === "UPDATE") && (
        <ProgressIndicators slideIndex={slideIndex} />
      )}
    </>
  )
}
