import { describe, expect, it } from "vitest"
import { contactFormSchema, ContactFormValues } from "@/utils/contactForm"

const validFormValues: ContactFormValues = {
  firstName: "Ada",
  lastName: "Lovelace",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  phoneNumber: "",
  email: "ada@example.com",
  addressEnabled: false,
}

describe("contact form schema", () => {
  it("reports an incomplete birthday at the day field", () => {
    const result = contactFormSchema.safeParse({
      ...validFormValues,
      birthYear: "2000",
      birthMonth: "02",
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ["birthDay"],
        message: "Please enter a complete date of birth.",
      }),
    )
  })

  it("reports every missing field when address collection is enabled", () => {
    const result = contactFormSchema.safeParse({
      ...validFormValues,
      addressEnabled: true,
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(
      result.error.issues.filter(
        ({ message }) => message === "Please enter a complete address.",
      ),
    ).toEqual(
      expect.arrayContaining(
        ["streetAddress", "city", "state", "zipCode"].map((field) =>
          expect.objectContaining({ path: [field] }),
        ),
      ),
    )
  })
})
