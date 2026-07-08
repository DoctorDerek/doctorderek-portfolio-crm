"use client"

import { Menu } from "@headlessui/react"
import { Dispatch, SetStateAction, useState } from "react"
import { AGE_RANGES } from "@/contacts/AGE_RANGES"
import classNames from "@/utils/classNames"

/**
 * The `<SearchBar>` powers the "search by age range" feature, though the
 * filtering logic itself happens in the `<ContactList>` component. */
export default function SearchBar({
  filterText,
  setFilterText,
}: {
  filterText: string
  setFilterText: Dispatch<SetStateAction<string>>
}) {
  /** Whether we're showing the dropdown menu with the age ranges. */
  const [showDropdown, setShowDropdown] = useState(false)

  /** A helper so we fade the opacity of the dropdown over 1 second. */
  const [hidingDropdown, setHidingDropdown] = useState(false)

  /**
   * We keep track of the timeout so we can cancel it if the user hovers over. */
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout>()

  /**
   * We delay the hiding of the dropdown so that the user can
   * click on the dropdown item without it disappearing. 😊
   */
  const hideDropdown = () => {
    setHidingDropdown(true)

    setDropdownTimeout(setTimeout(() => setShowDropdown(false), 1000))
  }

  return (
    <>
      {/** Click outside helper function for closing the dropdown menu. */}
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
        {/* We use `<Menu>` from Headless UI to handle the dropdown menu. */}
        {() => (
          <>
            {/* We don't need to reference `open` without `<Menu.Button>`. */}
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
                    {/* The `static` prop means the menu is "always open". */}
                    {AGE_RANGES.map((ageRange) => (
                      <Menu.Item key={ageRange.label}>
                        {({ active }) => {
                          /** i.e. 30-59 */
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
