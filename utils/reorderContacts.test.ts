import { describe, expect, it } from "vitest"
import reorderContacts from "@/utils/reorderContacts"
import type { Contact } from "@/types/Contact"

const makeContact = (id: number, order = 0): Contact => ({
  id,
  firstName: `First ${id}`,
  lastName: `Last ${id}`,
  order,
})

describe("reorderContacts", () => {
  it("reorders only visible contacts and preserves hidden contacts", () => {
    const contacts = [
      makeContact(1, 0),
      makeContact(99, 1),
      makeContact(2, 2),
      makeContact(3, 3),
      makeContact(100, 4),
    ]

    const reorderedContacts = reorderContacts({
      contacts,
      filteredContactIds: [1, 2, 3],
      reorderedFilteredContactIds: [2, 1, 3],
    })

    expect(reorderedContacts.map(({ id }) => id)).toEqual([
      2,
      99,
      1,
      3,
      100,
    ])
  })

  it("returns the original list for mismatched reorder payloads", () => {
    const contacts = [makeContact(1), makeContact(2), makeContact(3)]
    const reorderedContacts = reorderContacts({
      contacts,
      filteredContactIds: [1, 2, 3],
      reorderedFilteredContactIds: [1, 2, 4],
    })

    expect(reorderedContacts).toBe(contacts)
  })

  it("returns the original list when filtered list includes duplicates", () => {
    const contacts = [makeContact(1), makeContact(2), makeContact(3)]
    const reorderedContacts = reorderContacts({
      contacts,
      filteredContactIds: [1, 1, 2],
      reorderedFilteredContactIds: [1, 1, 2],
    })

    expect(reorderedContacts).toBe(contacts)
  })

  it("returns the original list if filtered list order is unchanged", () => {
    const contacts = [makeContact(1), makeContact(2), makeContact(3)]
    const reorderedContacts = reorderContacts({
      contacts,
      filteredContactIds: [1, 2, 3],
      reorderedFilteredContactIds: [1, 2, 3],
    })

    expect(reorderedContacts).toBe(contacts)
  })
})
