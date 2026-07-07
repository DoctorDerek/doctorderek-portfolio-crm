"use client"

import classNames from "@/utils/classNames"
import { Switch } from "@headlessui/react"
import { Dispatch, SetStateAction } from "react"

/** This is the toggle to show the optional address fields. */
export default function ContactDialogToggle({
  addressEnabled,
  setAddressEnabled,
}: {
  addressEnabled: boolean
  setAddressEnabled: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <Switch.Group
      as="div"
      className="flex items-center justify-between pt-4 pb-2"
    >
      <span className="flex grow flex-col">
        <Switch.Label
          as="span"
          className="text-sm leading-6 font-medium text-gray-500 dark:text-gray-300"
          passive
        >
          Show address fields
        </Switch.Label>
      </span>

      <Switch
        checked={addressEnabled}
        onChange={setAddressEnabled}
        className={classNames(
          addressEnabled ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700",
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-hidden",
        )}
      >
        <span className="sr-only">Use setting</span>
        <span
          className={classNames(
            addressEnabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-gray-100 shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-gray-800",
          )}
        >
          <span
            className={classNames(
              addressEnabled
                ? "opacity-0 duration-100 ease-out"
                : "opacity-100 duration-200 ease-in",
              "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
            )}
            aria-hidden="true"
          >
            <svg
              className="h-3 w-3 text-gray-400"
              fill="none"
              viewBox="0 0 12 12"
            >
              <path
                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className={classNames(
              addressEnabled
                ? "opacity-100 duration-200 ease-in"
                : "opacity-0 duration-100 ease-out",
              "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
            )}
            aria-hidden="true"
          >
            <svg
              className="h-3 w-3 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </span>
      </Switch>
    </Switch.Group>
  )
}
