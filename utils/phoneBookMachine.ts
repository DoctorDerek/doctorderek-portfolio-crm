import { assign, setup } from "xstate"
import CONTACTS_WITH_AGES from "@/contacts/CONTACTS"
import { Contact } from "@/types/Contact"
import { PersistenceFailure } from "@/types/PersistenceFailure"
import { calculateAge } from "@/utils/calculateAge"
import { getErrorMessage } from "@/utils/errors"
import { sortByLastName } from "@/utils/sortByLastName"
import parseStoredContacts from "@/utils/storedContactsSchema"

export const CONTACTS_STORAGE_KEY = "phonebook-filter-by-age"

const phoneBookMachine = setup({
  types: {} as {
    context: {
      contacts: Contact[]
      persistenceFailure: PersistenceFailure | null
    }
    events:
      | { type: "CREATE"; contact: Contact }
      | { type: "READ" }
      | { type: "UPDATE"; contact: Contact }
      | { type: "DELETE"; contact: Contact }
      | { type: "TOGGLE_FAVORITE"; contactId: number }
      | { type: "CLEAR_PERSISTENCE_FAILURE" }
      | { type: "RESET" }
  },
  actions: {
    readPhoneBookFromLocalStorage: assign(() => {
      const storedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY)
      if (!storedContacts)
        return { contacts: CONTACTS_WITH_AGES, persistenceFailure: null }

      try {
        const contacts = parseStoredContacts(storedContacts)
        contacts.sort(sortByLastName)
        return { contacts, persistenceFailure: null }
      } catch (error) {
        return {
          contacts: CONTACTS_WITH_AGES,
          persistenceFailure: {
            operation: "read",
            message: getErrorMessage(error),
          } as const,
        }
      }
    }),
    createContact: assign({
      contacts: ({ context, event }) => {
        if (event.type !== "CREATE") return context.contacts
        const { birthYear, birthMonth, birthDay } = event.contact
        const newContact = {
          ...event.contact,
          age: calculateAge({ birthYear, birthMonth, birthDay }),
        }
        return [...context.contacts, newContact].sort(sortByLastName)
      },
    }),
    updateContact: assign({
      contacts: ({ context, event }) => {
        if (event.type !== "UPDATE") return context.contacts
        const { birthYear, birthMonth, birthDay } = event.contact
        const updatedContact = {
          ...event.contact,
          age: calculateAge({ birthYear, birthMonth, birthDay }),
        }
        return context.contacts
          .map((contact) =>
            contact.id === updatedContact.id ? updatedContact : contact,
          )
          .sort(sortByLastName)
      },
    }),
    deleteContact: assign({
      contacts: ({ context, event }) => {
        if (event.type !== "DELETE") return context.contacts
        const currentPhoneBookEntries = [...context.contacts]
        const deletedContact = event.contact
        const filteredPhoneBookEntries = currentPhoneBookEntries.filter(
          ({ id }) => id !== deletedContact.id,
        )
        return filteredPhoneBookEntries
      },
    }),
    toggleContactFavorite: assign({
      contacts: ({ context, event }) => {
        if (event.type !== "TOGGLE_FAVORITE") return context.contacts

        return context.contacts.map((contact) =>
          contact.id === event.contactId
            ? { ...contact, isFavorite: !contact.isFavorite }
            : contact,
        )
      },
    }),
    writePhoneBookToLocalStorage: assign(({ context }) => {
      try {
        localStorage.setItem(
          CONTACTS_STORAGE_KEY,
          JSON.stringify(context.contacts),
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
      contacts: () => CONTACTS_WITH_AGES,
    }),
  },
}).createMachine({
  id: "phoneBook",
  initial: "idle",
  context: {
    contacts: CONTACTS_WITH_AGES as Contact[],
    persistenceFailure: null,
  },
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
