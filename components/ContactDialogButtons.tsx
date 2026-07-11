import { KeenSliderHooks, KeenSliderInstance } from "keen-slider/react.es"
import { MutableRefObject, ReactNode } from "react"
import { DialogState } from "@/types"
import classNames from "@/utils/classNames"

/** A checkmark from Heroicons.com */
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
      className={classNames(
        "flex items-center rounded-sm border border-solid pr-2",
        slideIndex === thisSlideIndex
          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
          : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300",
      )}
    >
      <span className="flex h-6 w-6 items-center justify-end font-bold sm:h-8 sm:w-8">
        {slideIndex >= thisSlideIndex ? (
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
        Security
      </ProgressIndicator>
      <ProgressIndicator slideIndex={slideIndex} thisSlideIndex={3}>
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
  onClick?: () => void
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

/**
 * For "CREATE" and "UPDATE" sections, the buttons handle slide navigation for
 * the multi-step form, so that "Submit" is only on the last slide.
 *
 * For "DELETE" and "RESET" dialogs, it's a single slide, so we only need the
 * "Cancel" and "Submit" buttons.
 * */
export default function ContactDialogButtons({
  dialogState,
  closeDialog,
  instanceRef,
  slideIndex,
}: {
  dialogState: DialogState
  closeDialog: () => void
  instanceRef: MutableRefObject<KeenSliderInstance<
    unknown,
    unknown,
    KeenSliderHooks
  > | null>
  /**
   * The `slideIndex` from the `onChanged` handler of the `useKeenSlider` hook.
   * We know in advance that the maxIndex is 3, since we've hardcoded 4 slides.
   * */
  slideIndex: number
}) {
  const maxIndex = 3
  const handleBack = () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE") {
      closeDialog()
      return
    }
    if (slideIndex === 0) {
      closeDialog()
      return
    }
    instanceRef.current?.prev()
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
  const handleNext = () => {
    if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE") return
    if (slideIndex === maxIndex) return
    instanceRef.current?.next()
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
        {/* Show "Cancel" on the 1st slide; otherwise show a "Back" button. */}
        <ContactDialogButton
          type="button"
          label={getBackLabel()}
          color="bg-gray-800 text-white hover:bg-gray-700 hover:outline-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:outline-gray-700"
          onClick={handleBack}
        />
        {/* Show "Next" on slides except the last; show "Submit" on last. */}
        <ContactDialogButton
          type={getNextButtonType()}
          label={getNextLabel()}
          color="bg-blue-400 text-white hover:bg-blue-500 hover:outline-blue-400"
          onClick={
            dialogState.type !== "CREATE" && dialogState.type !== "UPDATE"
              ? undefined
              : slideIndex === maxIndex
                ? undefined
                : handleNext
          }
        />
      </div>
      {(dialogState.type === "CREATE" || dialogState.type === "UPDATE") && (
        <ProgressIndicators slideIndex={slideIndex} />
      )}
    </>
  )
}
