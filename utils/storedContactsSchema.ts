import { z } from "zod"
import { Contact } from "@/types/Contact"
import { calculateAge } from "@/utils/calculateAge"

const canonicalContactSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  birthYear: z.string().optional(),
  birthMonth: z.string().optional(),
  birthDay: z.string().optional(),
  photo: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  isFavorite: z.boolean().optional(),
})

const readableStoredContactsSchema = z.array(
  canonicalContactSchema.extend({ age: z.number().optional() }),
)

export default function parseStoredContacts(storedContacts: string) {
  return readableStoredContactsSchema
    .parse(JSON.parse(storedContacts))
    .map((storedContact) => {
      const contact = canonicalContactSchema.parse(storedContact)
      return { ...contact, age: calculateAge(contact) }
    })
}

export function serializeStoredContacts(contacts: Contact[]) {
  return JSON.stringify(
    contacts.map((contact) => canonicalContactSchema.parse(contact)),
  )
}
