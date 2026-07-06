import { Contact } from "@/contacts/CONTACTS"

/**
 * Return the `filterByAgeRange` function for use in the `<ContactList>`.
 */
export default function useFilterByAgeRange({
  filterText,
}: {
  filterText: string
}) {
  function filterByAgeRange(contact: Contact) {
    filterText.replaceAll(" ", "") // Remove spaces from the filter text.
    if (filterText === "") return true // Show all contacts.

    const age = contact?.age
    if (age === undefined) return false // Don't show contacts without age.

    // We expect the `filterText` to match one of 7 formats:
    // Greater than: ">18"
    if (filterText.includes(">")) {
      const ageFilter = parseInt(filterText.replace(">", ""))
      return age > ageFilter
    }
    // Less than: "<18"
    if (filterText.includes("<")) {
      const ageFilter = parseInt(filterText.replace("<", ""))
      return age < ageFilter
    }
    // Greater than or equal to: ">=18"
    if (filterText.includes(">=")) {
      const ageFilter = parseInt(filterText.replace(">=", ""))
      return age >= ageFilter
    }
    // Less than or equal to: "<=18"
    if (filterText.includes("<=")) {
      const ageFilter = parseInt(filterText.replace("<=", ""))
      return age <= ageFilter
    }
    // Between a range, e.g. "30-40"
    const ageRange = filterText.split("-")
    if (ageRange.length === 2) {
      const [min, max] = ageRange
      return age >= parseInt(min) && age <= parseInt(max)
    }
    // Matching one of a comma-separated list of numbers, e.g. "30,40,50"
    const ageList = filterText.split(",")
    if (ageList.length > 1) {
      return ageList.includes(age.toString())
    }
    // Equal to a single number, e.g. "30" or "=30"
    const ageFilter = parseInt(filterText.replace("=", ""))
    return age === ageFilter
  }
  return { filterByAgeRange }
}
