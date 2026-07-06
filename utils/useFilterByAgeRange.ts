import { Contact } from "@/types"

/**
 * Return the `filterByAgeRange` function for use in the `<ContactList>`.
 */
export default function useFilterByAgeRange({
  filterText,
}: {
  filterText: string
}) {
  function filterByAgeRange(contact: Contact) {
    filterText.replaceAll(" ", "") 
    if (filterText === "") return true 

    const age = contact?.age
    if (age === undefined) return false 

    
    
    if (filterText.includes(">")) {
      const ageFilter = parseInt(filterText.replace(">", ""))
      return age > ageFilter
    }
    
    if (filterText.includes("<")) {
      const ageFilter = parseInt(filterText.replace("<", ""))
      return age < ageFilter
    }
    
    if (filterText.includes(">=")) {
      const ageFilter = parseInt(filterText.replace(">=", ""))
      return age >= ageFilter
    }
    
    if (filterText.includes("<=")) {
      const ageFilter = parseInt(filterText.replace("<=", ""))
      return age <= ageFilter
    }
    
    const ageRange = filterText.split("-")
    if (ageRange.length === 2) {
      const [min, max] = ageRange
      return age >= parseInt(min) && age <= parseInt(max)
    }
    
    const ageList = filterText.split(",")
    if (ageList.length > 1) {
      return ageList.includes(age.toString())
    }
    
    const ageFilter = parseInt(filterText.replace("=", ""))
    return age === ageFilter
  }
  return { filterByAgeRange }
}
