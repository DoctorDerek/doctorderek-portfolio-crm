import { assign, setup } from "xstate"
import createDemonstrationContacts from "@/contacts/CONTACTS"
import { Contact } from "@/types/Contact"
import { PersistenceFailure } from "@/types/PersistenceFailure"
import { calculateAge } from "@/utils/calculateAge"
import { getErrorMessage } from "@/utils/errors"
import reorderContacts from "@/utils/reorderContacts"
import parseStoredContacts, {
  serializeStoredContacts,
} from "@/utils/storedContactsSchema"

export const CONTACTS_STORAGE_KEY = "phonebook-filter-by-age"

function ensureContactOrder(contacts: Contact[]) {
  const normalizedContactEntries = contacts.map((contact, index) => ({
    ...contact,
    order: contact.order ?? index,
  }))

  return normalizedContactEntries
    .sort((a, b) => a.order - b.order)
    .map((contact, index) => ({ ...contact, order: index }))
}

function reassignContactAges(contacts: Contact[]) {
  return contacts.map((contact) => {
    const { birthYear, birthMonth, birthDay } = contact
    return {
      ...contact,
      age: calculateAge({ birthYear, birthMonth, birthDay }),
    }
  })
}

function moveContactInOrder(
  contacts: Contact[],
  event: { type: "MOVE_CONTACT"; direction: "down" | "up"; contactId: number },
) {
  const orderedContacts = ensureContactOrder(contacts)
  const { direction, contactId } = event
  const currentIndex = orderedContacts.findIndex(({ id }) => id === contactId)
  if (currentIndex < 0) return contacts

  const targetIndex = currentIndex + (direction === "down" ? 1 : -1)
  if (targetIndex < 0 || targetIndex >= orderedContacts.length)
    return orderedContacts

  const nextContacts = [...orderedContacts]
  const [movedContact] = nextContacts.splice(currentIndex, 1)
  nextContacts.splice(targetIndex, 0, movedContact)

  return ensureContactOrder(
    nextContacts.map((contact) => ({ ...contact, order: undefined })),
  )
}

function moveContactToContact(
  contacts: Contact[],
  event: {
    type: "MOVE_CONTACT_TO_CONTACT"
    contactId: number
    targetContactId: number
    insertAfter: boolean
  },
) {
  const orderedContacts = ensureContactOrder(contacts)
  const { contactId, targetContactId, insertAfter } = event
  const sourceIndex = orderedContacts.findIndex(({ id }) => id === contactId)
  const targetIndex = orderedContacts.findIndex(
    ({ id }) => id === targetContactId,
  )

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return orderedContacts
  }

  const nextContacts = [...orderedContacts]
  const [movedContact] = nextContacts.splice(sourceIndex, 1)

  const adjustedTargetIndex = nextContacts.findIndex(
    ({ id }) => id === targetContactId,
  )
  const insertionIndex = Math.min(
    Math.max(adjustedTargetIndex + (insertAfter ? 1 : 0), 0),
    nextContacts.length,
  )
  nextContacts.splice(insertionIndex, 0, movedContact)

  return ensureContactOrder(
    nextContacts.map((contact) => ({ ...contact, order: undefined })),
  )
}

type PhoneBookEvent =
  | { type: "CREATE"; contact: Contact }
  | { type: "READ" }
  | { type: "UPDATE"; contact: Contact }
  | { type: "DELETE"; contact: Contact }
  | { type: "TOGGLE_FAVORITE"; contactId: number }
  | { type: "MOVE_CONTACT"; contactId: number; direction: "up" | "down" }
  | {
      type: "MOVE_CONTACT_TO_CONTACT"
      contactId: number
      targetContactId: number
      insertAfter: boolean
    }
  | {
      type: "REORDER_FILTERED_CONTACTS"
      filteredContactIds: number[]
      reorderedFilteredContactIds: number[]
    }
  | { type: "CLEAR_PERSISTENCE_FAILURE" }
  | { type: "RESET" }

const phoneBookMachine = setup({
  types: {} as {
    context: {
      contacts: Contact[]
      persistenceFailure: PersistenceFailure | null
    }
    events: PhoneBookEvent
  },
  actions: {
    readPhoneBookFromLocalStorage: assign(() => {
      const storedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY)
      if (!storedContacts)
        return {
          contacts: createDemonstrationContacts(),
          persistenceFailure: null,
        }

      try {
        const contacts = ensureContactOrder(parseStoredContacts(storedContacts))
        const contactsWithAge = reassignContactAges(contacts)
        return { contacts: contactsWithAge, persistenceFailure: null }
      } catch (error) {
        return {
          contacts: createDemonstrationContacts(),
          persistenceFailure: {
            operation: "read",
            message: getErrorMessage(error),
          } as const,
        }
      }
    }),
    createContact: assign({
      contacts: ({ context, event }) => {
        const createEvent = event as Extract<PhoneBookEvent, { type: "CREATE" }>
        const { birthYear, birthMonth, birthDay } = createEvent.contact
        const newContact = {
          ...createEvent.contact,
          age: calculateAge({ birthYear, birthMonth, birthDay }),
          order: context.contacts.length,
        }
        return ensureContactOrder([...context.contacts, newContact])
      },
    }),
    updateContact: assign({
      contacts: ({ context, event }) => {
        const updateEvent = event as Extract<PhoneBookEvent, { type: "UPDATE" }>
        const { birthYear, birthMonth, birthDay } = updateEvent.contact
        const updatedContact = {
          ...updateEvent.contact,
          age: calculateAge({ birthYear, birthMonth, birthDay }),
        }
        return context.contacts.map((contact) =>
          contact.id === updatedContact.id ? updatedContact : contact,
        )
      },
    }),
    deleteContact: assign({
      contacts: ({ context, event }) => {
        const currentPhoneBookEntries = [...context.contacts]
        const deleteEvent = event as Extract<PhoneBookEvent, { type: "DELETE" }>
        const deletedContact = deleteEvent.contact
        const filteredPhoneBookEntries = currentPhoneBookEntries.filter(
          ({ id }) => id !== deletedContact.id,
        )
        return ensureContactOrder(filteredPhoneBookEntries)
      },
    }),
    toggleContactFavorite: assign({
      contacts: ({ context, event }) => {
        const favoriteEvent = event as Extract<
          PhoneBookEvent,
          { type: "TOGGLE_FAVORITE" }
        >

        return context.contacts.map((contact) =>
          contact.id === favoriteEvent.contactId
            ? { ...contact, isFavorite: !contact.isFavorite }
            : contact,
        )
      },
    }),
    writePhoneBookToLocalStorage: assign(({ context }) => {
      try {
        localStorage.setItem(
          CONTACTS_STORAGE_KEY,
          serializeStoredContacts(context.contacts),
        )
        return { persistenceFailure: null }
      } catch (error) {
        return {
          persistenceFailure: {
            operation: "write",
            message: getErrorMessage(error),
          } as const,
        }
      }
    }),
    clearPersistenceFailure: assign({
      persistenceFailure: () => null,
    }),
    resetPhoneBookEntries: assign({
      contacts: () => createDemonstrationContacts(),
    }),
    reorderContact: assign({
      contacts: ({ context, event }) => {
        return moveContactInOrder(
          context.contacts,
          event as Extract<PhoneBookEvent, { type: "MOVE_CONTACT" }>,
        )
      },
    }),
    reorderContactToContact: assign({
      contacts: ({ context, event }) => {
        return moveContactToContact(
          context.contacts,
          event as Extract<PhoneBookEvent, { type: "MOVE_CONTACT_TO_CONTACT" }>,
        )
      },
    }),
    reorderFilteredContacts: assign({
      contacts: ({ context, event }) => {
        const reorderEvent = event as Extract<
          PhoneBookEvent,
          { type: "REORDER_FILTERED_CONTACTS" }
        >
        const nextContacts = reorderContacts({
          contacts: context.contacts,
          filteredContactIds: reorderEvent.filteredContactIds,
          reorderedFilteredContactIds: reorderEvent.reorderedFilteredContactIds,
        })
        if (nextContacts === context.contacts) return context.contacts
        return ensureContactOrder(
          nextContacts.map((contact) => ({ ...contact, order: undefined })),
        )
      },
    }),
  },
}).createMachine({
  id: "phoneBook",
  initial: "idle",
  context: () => ({
    contacts: createDemonstrationContacts(),
    persistenceFailure: null,
  }),
  states: {
    idle: {
      on: {
        READ: {
          target: "ready",
          actions: "readPhoneBookFromLocalStorage",
        },
      },
    },
    ready: {
      on: {
        CREATE: {
          actions: ["createContact", "writePhoneBookToLocalStorage"],
        },
        UPDATE: {
          actions: ["updateContact", "writePhoneBookToLocalStorage"],
        },
        DELETE: {
          actions: ["deleteContact", "writePhoneBookToLocalStorage"],
        },
        TOGGLE_FAVORITE: {
          actions: ["toggleContactFavorite", "writePhoneBookToLocalStorage"],
        },
        MOVE_CONTACT: {
          actions: ["reorderContact", "writePhoneBookToLocalStorage"],
        },
        MOVE_CONTACT_TO_CONTACT: {
          actions: ["reorderContactToContact", "writePhoneBookToLocalStorage"],
        },
        REORDER_FILTERED_CONTACTS: {
          actions: ["reorderFilteredContacts", "writePhoneBookToLocalStorage"],
        },
        RESET: {
          actions: ["resetPhoneBookEntries", "writePhoneBookToLocalStorage"],
        },
        CLEAR_PERSISTENCE_FAILURE: {
          actions: "clearPersistenceFailure",
        },
      },
    },
  },
})

export default phoneBookMachine
