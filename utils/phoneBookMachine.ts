import { sortByLastName } from "@/utils/sortByLastName"
import { calculateAge } from "@/utils/calculateAge"
import { Contact } from "@/types"
import CONTACTS_WITH_AGES, {
  calculateAge,
  
  sortByLastName,
} from "@/contacts/CONTACTS"
import { assign, createMachine } from "xstate"

export const LOCALSTORAGE_KEY_AUTH = "phonebook-filter-by-age"

const phoneBookMachine = createMachine(
  {
    
    predictableActionArguments: true,
    id: "phoneBook",
    
    tsTypes: {} as import("./phoneBookMachine.typegen").Typegen0,
    schema: {
      
      context: {} as { contacts: Contact[] },
      
      events: {} as  
        | { type: "CREATE"; contact: Contact }
        | {
            type: "READ"
          }
        | { type: "UPDATE"; contact: Contact }
        | { type: "DELETE"; contact: Contact }
        | {
            type: "FINISH"
          }
        | {
            type: "RESET"
          },
    },
    
    initial: "idle",
    
    context: {
      contacts: CONTACTS_WITH_AGES as Contact[],
    },
    states: {
      idle: {
        on: {
          READ: {
            target: "ready",
            
            actions: ["readPhoneBookFromLocalStorage"],
          },
        },
      },
      ready: {
        on: {
          CREATE: {
            target: "running",
            
            actions: ["createContact"],
          },
          UPDATE: {
            target: "running",
            
            actions: ["updateContact"],
          },
          DELETE: {
            target: "running",
            
            actions: ["deleteContact"],
          },
          RESET: {
            target: "running",
            
            actions: ["resetPhoneBookEntries"],
          },
        },
      },
      running: {
        on: {
          FINISH: {
            target: "idle",
            
            actions: ["writePhoneBookToLocalStorage"],
          },
        },
      },
    },
  },
  {
    actions: {
      readPhoneBookFromLocalStorage: assign({
        
        contacts: (context, event) => {
          const localStorageString = localStorage.getItem(LOCALSTORAGE_KEY_AUTH)
          if (localStorageString)
            try {
              const localStorageObject = JSON.parse(
                localStorageString,
              ) as Contact[]
              
              localStorageObject.sort(sortByLastName)
              return localStorageObject as Contact[]
            } catch (error: any) {
              console.log(error) 
            }
          return CONTACTS_WITH_AGES
        },
      }),
      createContact: assign({
        contacts: (context, event) => {
          const currentPhoneBookEntries = context.contacts
          const newContact = event.contact
          
          const { birthYear, birthMonth, birthDay } = newContact
          newContact.age = calculateAge({ birthYear, birthMonth, birthDay })
          currentPhoneBookEntries.push(newContact)
          return currentPhoneBookEntries
        },
      }),
      updateContact: assign({
        contacts: (context, event) => {
          const currentPhoneBookEntries = context.contacts
          const updatedContact = event.contact
          const filteredPhoneBookEntries = currentPhoneBookEntries.filter(
            ({ id }) => id !== updatedContact.id,
          )
          filteredPhoneBookEntries.push(updatedContact)
          return filteredPhoneBookEntries
        },
      }),
      deleteContact: assign({
        contacts: (context, event) => {
          const currentPhoneBookEntries = context.contacts
          const deletedContact = event.contact
          const filteredPhoneBookEntries = currentPhoneBookEntries.filter(
            ({ id }) => id !== deletedContact.id,
          )
          return filteredPhoneBookEntries
        },
      }),
      writePhoneBookToLocalStorage: (context, event) => {
        try {
          localStorage.setItem(
            LOCALSTORAGE_KEY_AUTH,
            JSON.stringify(context.contacts),
          )
        } catch (error: any) {
          console.log(error) 
        }
      },
      resetPhoneBookEntries: assign({
        contacts: (context, event) => CONTACTS_WITH_AGES,
      }),
    },
  },
)

export default phoneBookMachine
