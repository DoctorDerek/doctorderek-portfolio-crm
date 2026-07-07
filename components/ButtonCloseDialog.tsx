import classNames from "@/utils/classNames"
import { XMarkIcon } from "@heroicons/react/24/solid"

/**
 * This close button is used in the `<CloseDialog>` and `<NavBar>` components. */
export default function ButtonCloseDialog({
  closeDialog,
  size = "h-6 w-6",
}: {
  closeDialog: () => void
  /**
   * The default size is used in the `<ContactDialog>`, while the larger size
   * is used in the `<NavBar>` for the mobile navigation menu's close button. */
  size?: "h-6 w-6" | "h-12 w-12"
}) {
  return (
    <button
      onClick={closeDialog}
      className={classNames(
        "group absolute top-2 right-2 rounded-lg hover:outline-1 hover:outline-gray-600 hover:outline-solid",
        size,
      )}
    >
      <XMarkIcon
        aria-label="Close dialog"
        className="fill-gray-500 group-hover:fill-gray-600 dark:fill-gray-200 dark:group-hover:fill-gray-100"
      />
    </button>
  )
}
