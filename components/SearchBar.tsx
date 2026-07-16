"use client"

import { Menu } from "@headlessui/react"
import { Dispatch, SetStateAction, useState } from "react"
import { AGE_RANGES } from "@/contacts/AGE_RANGES"
import classNames from "@/utils/classNames"

export default function SearchBar({
  filterText,
  setFilterText,
}: {
  filterText: string
  setFilterText: Dispatch<SetStateAction<string>>
}) {
  const [showDropdown, setShowDropdown] = useState(false)

  const [hidingDropdown, setHidingDropdown] = useState(false)

  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout>()

  const hideDropdown = () => {
    setHidingDropdown(true)

    setDropdownTimeout(setTimeout(() => setShowDropdown(false), 1000))
  }

  return (
    <>
      <div
        className="fixed inset-0 -z-10"
        onClick={hideDropdown}
        onKeyDown={(e) => {
          if (e.key === "Enter") hideDropdown()
        }}
        role="button"
        tabIndex={0}
      />
      <Menu>
        {() => (
          <>
            <label
              className="relative flex w-full flex-col space-y-1.5"
              id="filter"
            >
              <span className="text-xs font-semibold tracking-widest uppercase">
                Age Ranges
              </span>
              <input
                type="text"
                placeholder="TYPE TO SEARCH"
                className="w-full bg-gray-200 p-4 tracking-widest placeholder:text-xs placeholder:font-medium placeholder:text-gray-500 dark:bg-gray-500 dark:placeholder:text-gray-300"

                onChange={(event) => setFilterText(event?.target?.value)}
                onFocus={() => {
                  setShowDropdown(true)

                  setHidingDropdown(false)
                  if (dropdownTimeout) clearTimeout(dropdownTimeout)
                }}

                onBlur={hideDropdown}

                value={filterText}
              />
              {showDropdown && (
                <div
                  className={classNames(
                    "absolute top-full z-10 w-full transform-gpu transition-opacity duration-1000",
                    hidingDropdown ? "opacity-0" : "opacity-100",
                  )}
                >
                  <Menu.Items static>
                    {AGE_RANGES.map((ageRange) => (
                      <Menu.Item key={ageRange.label}>
                        {({ active }) => {
                          const ageRangeString = `${ageRange.rangeBottom}-${ageRange.rangeTop}`
                          return (
                            <button
                              className={classNames(
                                active
                                  ? "bg-blue-500 text-white dark:bg-blue-400 dark:text-gray-100"
                                  : "bg-gray-200 text-gray-500 dark:bg-gray-500 dark:text-gray-200",
                                "w-full p-4 text-left font-medium tracking-widest uppercase",
                              )}
                              onClick={() => setFilterText(ageRangeString)}
                            >
                              {ageRange.label} ({ageRangeString})
                            </button>
                          )
                        }}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </div>
              )}
            </label>
          </>
        )}
      </Menu>
    </>
  )
}
