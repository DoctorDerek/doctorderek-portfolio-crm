"use client"

import { AGE_RANGES } from "@/contacts/AGE_RANGES"
import { ContactFilters } from "@/types/ContactFilters"

export default function SearchBar({
  contactFilters,
  onSearchQueryChange,
  onSelectedAgeRangeLabelChange,
  onClearFilters,
}: {
  contactFilters: ContactFilters
  onSearchQueryChange: (searchQuery: string) => void
  onSelectedAgeRangeLabelChange: (selectedAgeRangeLabel: string) => void
  onClearFilters: () => void
}) {
  const hasActiveFilters = Boolean(
    contactFilters.searchQuery || contactFilters.selectedAgeRangeLabel,
  )

  return (
    <fieldset className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.45fr)_auto]">
      <legend className="sr-only">Find contacts</legend>
      <label className="flex flex-col gap-1.5" htmlFor="contact-search">
        <span className="text-xs font-semibold tracking-widest uppercase">
          Search contacts
        </span>
        <input
          id="contact-search"
          type="search"
          autoComplete="off"
          placeholder="Name, email, phone, or location"
          className="min-h-12 w-full rounded-md bg-gray-200 px-4 tracking-wide placeholder:text-sm placeholder:text-gray-500 dark:bg-gray-700 dark:placeholder:text-gray-300"
          onChange={(event) => onSearchQueryChange(event.target.value)}
          value={contactFilters.searchQuery}
        />
      </label>
      <label className="flex flex-col gap-1.5" htmlFor="age-range-filter">
        <span className="text-xs font-semibold tracking-widest uppercase">
          Age range
        </span>
        <select
          id="age-range-filter"
          className="min-h-12 w-full rounded-md bg-gray-200 px-4 font-medium tracking-wide dark:bg-gray-700"
          onChange={(event) =>
            onSelectedAgeRangeLabelChange(event.target.value)
          }
          value={contactFilters.selectedAgeRangeLabel}
        >
          <option value="">All ages</option>
          {AGE_RANGES.map(({ label, rangeBottom, rangeTop }) => (
            <option key={label} value={label}>
              {label} ({rangeBottom}–{rangeTop})
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="min-h-12 self-end rounded-md bg-gray-800 px-4 font-semibold tracking-wide text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-600 dark:hover:bg-gray-500"
        disabled={!hasActiveFilters}
        onClick={onClearFilters}
      >
        Clear
      </button>
    </fieldset>
  )
}
