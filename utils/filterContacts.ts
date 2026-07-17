import { AGE_RANGES } from "@/contacts/AGE_RANGES"
import { Contact } from "@/types/Contact"
import { ContactFilters } from "@/types/ContactFilters"

function normalizeSearchValue(value: string) {
  return value.trim().toLocaleLowerCase().replaceAll(/\s+/g, " ")
}

function contactMatchesSearchQuery(contact: Contact, searchQuery: string) {
  const normalizedSearchQuery = normalizeSearchValue(searchQuery)
  if (!normalizedSearchQuery) return true

  const searchableContactText = normalizeSearchValue(
    [
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.phoneNumber,
      contact.streetAddress,
      contact.city,
      contact.state,
      contact.zipCode,
    ]
      .filter(Boolean)
      .join(" "),
  )

  return normalizedSearchQuery
    .split(" ")
    .every((searchTerm) => searchableContactText.includes(searchTerm))
}

function contactMatchesAgeRange(
  contact: Contact,
  selectedAgeRangeLabel: string,
) {
  if (!selectedAgeRangeLabel) return true

  const selectedAgeRange = AGE_RANGES.find(
    ({ label }) => label === selectedAgeRangeLabel,
  )
  if (!selectedAgeRange || contact.age === undefined) return false

  return (
    contact.age >= selectedAgeRange.rangeBottom &&
    contact.age <= selectedAgeRange.rangeTop
  )
}

export default function filterContacts(
  contacts: Contact[],
  { searchQuery, selectedAgeRangeLabel, showFavoritesOnly }: ContactFilters,
) {
  return contacts.filter(
    (contact) =>
      contactMatchesSearchQuery(contact, searchQuery) &&
      contactMatchesAgeRange(contact, selectedAgeRangeLabel) &&
      (!showFavoritesOnly || contact.isFavorite),
  )
}
