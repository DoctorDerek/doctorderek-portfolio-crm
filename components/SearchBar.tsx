"use client"

// Specify this is a Client Component, not a Server Component.
import { AGE_RANGES } from "@/contacts/AGE_RANGES"
import classNames from "@/utils/classNames"
import { Menu } from "@headlessui/react"
import { Dispatch, SetStateAction, useState } from "react"

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
    // We store the dropdown timeout to clear it if the user hovers.
    setDropdownTimeout(
      setTimeout(() => setShowDropdown(false), 1000) // 1 second
    )
  }

  return (
    <>
      {/** Click outside helper function for closing the dropdown menu. */}
      <div className="fixed inset-0 -z-10" onClick={hideDropdown} />
      <Menu>
        {/* We use `<Menu>` from Headless UI to handle the dropdown menu. */}
        {({ open }) => (
          <>
            {/* We don't need to reference `open` without `<Menu.Button>`. */}
            <label
              className="relative flex w-full flex-col space-y-1.5"
              id="filter" // Used for the anchor link "Filter" in the `<NavBar>`
            >
              <span className="text-xs font-semibold uppercase tracking-widest">
                Age Ranges
              </span>
              <input
                type="text"
                placeholder="TYPE TO SEARCH"
                className="w-full bg-gray-200 p-4 tracking-widest placeholder:text-xs placeholder:font-medium placeholder:text-gray-500 dark:bg-gray-500 dark:placeholder:text-gray-300"
                // We don't need all the overhead of "react-hook-form" here.
                onChange={(event) => setFilterText(event?.target?.value)}
                onFocus={() => {
                  // We show the dropdown when the user focuses on the input.
                  setShowDropdown(true)
                  // We make sure we're showing the dropdown and not hiding it.
                  setHidingDropdown(false)
                  if (dropdownTimeout) clearTimeout(dropdownTimeout)
                }}
                // We hide on blur not just "click outside" for keyboard users.
                onBlur={hideDropdown}
                // We include the value here so that the input is controlled.
                value={filterText}
                // The result is clicking a button will populate the input.
              />
              {showDropdown && ( // We handle the menu state ourselves.
                <div
                  className={classNames(
                    "absolute top-full z-10 w-full transform-gpu transition-opacity duration-1000",
                    hidingDropdown ? "opacity-0" : "opacity-100"
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
                                active // This is the  "on hover" style.
                                  ? "bg-blue-500 text-white dark:bg-blue-400 dark:text-gray-100"
                                  : "bg-gray-200 text-gray-500 dark:bg-gray-500 dark:text-gray-200",
                                "w-full p-4 text-left font-medium uppercase tracking-widest"
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
