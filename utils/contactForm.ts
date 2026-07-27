import { z } from "zod"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
import parseContactBirthday from "@/utils/contactBirthday"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9][0-9\s().-]{5,}$/
const ADDRESS_FIELD_NAMES = [
  "streetAddress",
  "city",
  "state",
  "zipCode",
] as const

export const contactFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    birthYear: z.string().trim(),
    birthMonth: z.string().trim(),
    birthDay: z.string().trim(),
    streetAddress: z.string().trim(),
    city: z.string().trim(),
    state: z.string().trim(),
    zipCode: z.string().trim(),
    phoneNumber: z.string().trim(),
    email: z
      .string()
      .trim()
      .refine(
        (email) => email === "" || EMAIL_PATTERN.test(email),
        "Please enter a valid email address.",
      ),
    addressEnabled: z.boolean(),
  })
  .superRefine((formValues, refinementContext) => {
    const birthdayValues = [
      formValues.birthYear,
      formValues.birthMonth,
      formValues.birthDay,
    ]
    const hasBirthdayValue = birthdayValues.some(Boolean)

    if (hasBirthdayValue && !birthdayValues.every(Boolean)) {
      refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDay"],
        message: "Please enter a complete date of birth.",
      })
    } else if (
      hasBirthdayValue &&
      !parseContactBirthday({
        birthYear: formValues.birthYear,
        birthMonth: formValues.birthMonth,
        birthDay: formValues.birthDay,
      })
    ) {
      refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDay"],
        message: "Please enter a valid date of birth.",
      })
    }

    if (
      formValues.phoneNumber !== "" &&
      !PHONE_PATTERN.test(formValues.phoneNumber)
    ) {
      refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "Please enter a valid phone number.",
      })
    }

    if (!formValues.addressEnabled) return

    for (const addressFieldName of ADDRESS_FIELD_NAMES) {
      if (formValues[addressFieldName]) continue
      refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        path: [addressFieldName],
        message: "Please enter a complete address.",
      })
    }
  })

export type ContactFormValues = z.infer<typeof contactFormSchema>

function getContactFormAddressEnabled(contact: Contact | undefined): boolean {
  return (
    Boolean(contact?.streetAddress) ||
    Boolean(contact?.city) ||
    Boolean(contact?.state) ||
    Boolean(contact?.zipCode)
  )
}

function getContactFormValue(value: string | undefined): string {
  return value ?? ""
}

export function getContactFormDefaultValues(
  dialogState: DialogState,
): ContactFormValues {
  const contact =
    dialogState.type === "UPDATE" ? dialogState.contact : undefined

  return {
    firstName: getContactFormValue(contact?.firstName),
    lastName: getContactFormValue(contact?.lastName),
    birthYear: getContactFormValue(contact?.birthYear),
    birthMonth: getContactFormValue(contact?.birthMonth),
    birthDay: getContactFormValue(contact?.birthDay),
    streetAddress: getContactFormValue(contact?.streetAddress),
    city: getContactFormValue(contact?.city),
    state: getContactFormValue(contact?.state),
    zipCode: getContactFormValue(contact?.zipCode),
    phoneNumber: getContactFormValue(contact?.phoneNumber),
    email: getContactFormValue(contact?.email),
    addressEnabled: getContactFormAddressEnabled(contact),
  }
}

type ContactMetadata = Pick<Contact, "id"> &
  Partial<Pick<Contact, "photo" | "isFavorite" | "order">>

const getOptionalContactValue = (value: string) => value.trim() || undefined

export function buildContactFromFormValues(
  formValues: ContactFormValues,
  contactMetadata: ContactMetadata,
): Contact {
  const address = formValues.addressEnabled
    ? {
        streetAddress: getOptionalContactValue(formValues.streetAddress),
        city: getOptionalContactValue(formValues.city),
        state: getOptionalContactValue(formValues.state),
        zipCode: getOptionalContactValue(formValues.zipCode),
      }
    : {}

  return {
    id: contactMetadata.id,
    order: contactMetadata.order,
    firstName: formValues.firstName.trim(),
    lastName: formValues.lastName.trim(),
    birthYear: getOptionalContactValue(formValues.birthYear),
    birthMonth: getOptionalContactValue(formValues.birthMonth),
    birthDay: getOptionalContactValue(formValues.birthDay),
    phoneNumber: getOptionalContactValue(formValues.phoneNumber),
    email: getOptionalContactValue(formValues.email),
    photo: contactMetadata.photo,
    isFavorite: contactMetadata.isFavorite,
    ...address,
  }
}
