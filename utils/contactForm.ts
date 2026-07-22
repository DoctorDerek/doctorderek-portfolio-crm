import { z } from "zod"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
import parseContactBirthday from "@/utils/contactBirthday"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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

export function getContactFormDefaultValues(
  dialogState: DialogState,
): ContactFormValues {
  const contact =
    dialogState.type === "UPDATE" ? dialogState.contact : undefined

  return {
    firstName: contact?.firstName ?? "",
    lastName: contact?.lastName ?? "",
    birthYear: contact?.birthYear ?? "",
    birthMonth: contact?.birthMonth ?? "",
    birthDay: contact?.birthDay ?? "",
    streetAddress: contact?.streetAddress ?? "",
    city: contact?.city ?? "",
    state: contact?.state ?? "",
    zipCode: contact?.zipCode ?? "",
    phoneNumber: contact?.phoneNumber ?? "",
    email: contact?.email ?? "",
    addressEnabled: Boolean(
      contact?.streetAddress ||
      contact?.city ||
      contact?.state ||
      contact?.zipCode,
    ),
  }
}

type ContactMetadata = Pick<Contact, "id"> &
  Partial<Pick<Contact, "photo" | "isFavorite">>

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
