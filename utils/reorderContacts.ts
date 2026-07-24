import { Contact } from "@/types/Contact"

type ReorderContactsInput = {
  contacts: readonly Contact[]
  filteredContactIds: readonly number[]
  reorderedFilteredContactIds: readonly number[]
}

function areSameElements(left: readonly number[], right: readonly number[]) {
  if (left.length !== right.length) return false

  const rightIndex = new Set(right)
  return left.every((value) => rightIndex.has(value))
}

function hasSameOrder(left: readonly number[], right: readonly number[]) {
  return left.every((value, index) => right[index] === value)
}

export default function reorderContacts({
  contacts,
  filteredContactIds,
  reorderedFilteredContactIds,
}: ReorderContactsInput): Contact[] {
  if (!areSameElements(filteredContactIds, reorderedFilteredContactIds))
    return contacts as Contact[]

  if (hasSameOrder(filteredContactIds, reorderedFilteredContactIds))
    return contacts as Contact[]

  const filteredContactIdSet = new Set(filteredContactIds)
  if (filteredContactIdSet.size !== filteredContactIds.length)
    return contacts as Contact[]

  const reorderedFilteredContactIdSet = new Set(reorderedFilteredContactIds)
  if (
    reorderedFilteredContactIdSet.size !== reorderedFilteredContactIds.length ||
    reorderedFilteredContactIds.some(
      (contactId) => !filteredContactIdSet.has(contactId),
    )
  ) {
    return contacts as Contact[]
  }

  const filteredContactById = new Map<number, Contact>()
  const visibleSlotIndexes: number[] = []

  for (const [contactIndex, contact] of contacts.entries()) {
    if (filteredContactIdSet.has(contact.id)) {
      filteredContactById.set(contact.id, contact)
      visibleSlotIndexes.push(contactIndex)
    }
  }

  if (visibleSlotIndexes.length !== filteredContactIds.length) {
    return contacts as Contact[]
  }

  const nextContacts = [...contacts]

  for (const [
    visibleSlotIndex,
    contactId,
  ] of reorderedFilteredContactIds.entries()) {
    const visibleSlot = visibleSlotIndexes[visibleSlotIndex]
    const contact = filteredContactById.get(contactId)
    if (contact === undefined || visibleSlot === undefined) {
      return contacts as Contact[]
    }

    nextContacts[visibleSlot] = contact
  }

  return nextContacts
}
