import { z } from "zod"
import { Contact } from "@/types/Contact"

const storedContactSchema: z.ZodType<Contact> = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  birthYear: z.string().optional(),
  birthMonth: z.string().optional(),
  birthDay: z.string().optional(),
  age: z.number().optional(),
  photo: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  isFavorite: z.boolean().optional(),
})

const storedContactsSchema = z.array(storedContactSchema)

export default function parseStoredContacts(storedContacts: string) {
  return storedContactsSchema.parse(JSON.parse(storedContacts))
}
