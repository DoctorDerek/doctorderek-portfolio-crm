import { describe, expect, it } from "vitest"
import { Contact } from "@/types/Contact"
import { DEFAULT_CONTACT_FILTERS } from "@/types/ContactFilters"
import filterContacts from "@/utils/filterContacts"

const contacts: Contact[] = [
  {
    id: 1,
    firstName: "Ada",
    lastName: "Lovelace",
    age: 36,
    email: "ada@example.com",
    phoneNumber: "555-0101",
    city: "London",
    isFavorite: true,
  },
  {
    id: 2,
    firstName: "Grace",
    lastName: "Hopper",
    age: 85,
    email: "grace@example.com",
    phoneNumber: "555-0202",
    city: "New York",
  },
]

describe("filterContacts", () => {
  it.each(["ada", "LOVELACE", "ada@example.com", "555-0101", "london"])(
    "matches the search query %s across meaningful contact fields",
    (searchQuery) => {
      expect(
        filterContacts(contacts, {
          ...DEFAULT_CONTACT_FILTERS,
          searchQuery,
        }),
      ).toEqual([contacts[0]])
    },
  )

  it("requires every normalized search term to match", () => {
    expect(
      filterContacts(contacts, {
        ...DEFAULT_CONTACT_FILTERS,
        searchQuery: "  ADA   London ",
      }),
    ).toEqual([contacts[0]])
  })

  it("filters contacts by the selected age range", () => {
    expect(
      filterContacts(contacts, {
        ...DEFAULT_CONTACT_FILTERS,
        selectedAgeRangeLabel: "Seniors",
      }),
    ).toEqual([contacts[1]])
  })

  it("composes search age and favorite filters", () => {
    expect(
      filterContacts(contacts, {
        searchQuery: "ada",
        selectedAgeRangeLabel: "Middle Aged Adults",
        showFavoritesOnly: true,
      }),
    ).toEqual([contacts[0]])
  })

  it("returns an empty result when composed filters do not match", () => {
    expect(
      filterContacts(contacts, {
        searchQuery: "grace",
        selectedAgeRangeLabel: "Seniors",
        showFavoritesOnly: true,
      }),
    ).toEqual([])
  })
})
