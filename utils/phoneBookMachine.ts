import { assign, setup } from "xstate"
import CONTACTS_WITH_AGES from "@/contacts/CONTACTS"
import { Contact } from "@/types/Contact"
import { calculateAge } from "@/utils/calculateAge"
import { getErrorMessage } from "@/utils/errors"
import { sortByLastName } from "@/utils/sortByLastName"

export const LOCALSTORAGE_KEY_AUTH = "phonebook-filter-by-age"

const phoneBookMachine = setup({
  types: {} as {
    context: { contacts: Contact[] }
    events:
      | { type: "CREATE"; contact: Contact }
      | { type: "READ" }
      | { type: "UPDATE"; contact: Contact }
      | { type: "DELETE"; contact: Contact }
      | { type: "TOGGLE_FAVORITE"; contactId: number }
      | { type: "RESET" }
  },
  actions: {
    readPhoneBookFromLocalStorage: assign({
      contacts: () => {
        const localStorageString = localStorage.getItem(LOCALSTORAGE_KEY_AUTH)
        if (localStorageString)
          try {
            const localStorageObject = JSON.parse(
              localStorageString,
            ) as Contact[]

            localStorageObject.sort(sortByLastName)
            return localStorageObject
          } catch (error) {
            console.log(getErrorMessage(error))
          }
        return CONTACTS_WITH_AGES
      },
    }),
    createContact: assign({
      contacts: ({ context, event }) => {
        if (event.type !== "CREATE") return context.contacts
        const currentPhoneBookEntries = [...context.contacts]
        const newContact = event.contact

        const { birthYear, birthMonth, birthDay } = newContact
        newContact.age = calculateAge({ birthYear, birthMonth, birthDay })
        currentPhoneBookEntries.push(newContact)
        return currentPhoneBookEntries
      },
    }),
    updateContact: assign({
      contacts: ({ context, event }) => {
        if (event.type !== "UPDATE") return context.contacts
        const currentPhoneBookEntries = [...context.contacts]
        const updatedContact = event.contact
        const filteredPhoneBookEntries = currentPhoneBookEntries.filter(
          ({ id }) => id !== updatedContact.id,
        )
        filteredPhoneBookEntries.push(updatedContact)
        return filteredPhoneBookEntries
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
    writePhoneBookToLocalStorage: ({ context }) => {
      try {
        localStorage.setItem(
          LOCALSTORAGE_KEY_AUTH,
          JSON.stringify(context.contacts),
        )
      } catch (error) {
        console.log(getErrorMessage(error))
      }
    },
    resetPhoneBookEntries: assign({
      contacts: () => CONTACTS_WITH_AGES,
    }),
  },
}).createMachine({
  id: "phoneBook",
  initial: "idle",
  context: {
    contacts: CONTACTS_WITH_AGES as Contact[],
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
      },
    },
  },
})

export default phoneBookMachine
