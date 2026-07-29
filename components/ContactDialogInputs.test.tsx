import { render, screen } from "@testing-library/react"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { afterEach, describe, expect, it, vi } from "vitest"
import ContactDialogInputs from "@/components/ContactDialogInputs"
import {
  ContactFormValues,
  getContactFormDefaultValues,
} from "@/utils/contactForm"

let shouldReduceMotion: boolean | null = false

vi.mock("motion/react", async () => {
  const actual =
    await vi.importActual<typeof import("motion/react")>("motion/react")
  return {
    ...actual,
    useReducedMotion: () => shouldReduceMotion,
  }
})

const ADDRESS_ERROR_FIELDS = [
  "streetAddress",
  "city",
  "state",
  "zipCode",
] as const

type AddressErrorField = (typeof ADDRESS_ERROR_FIELDS)[number]

function ContactDialogInputsHarness({
  errorField,
  rootError = false,
}: {
  errorField?: AddressErrorField
  rootError?: boolean
}) {
  const { control, formState, register, setError, setValue } =
    useForm<ContactFormValues>({
      mode: "onTouched",
      defaultValues: getContactFormDefaultValues({ type: "CREATE" }),
    })
  const formValues = useWatch({
    control,
    compute: (completeFormValues) => completeFormValues,
  })

  useEffect(() => {
    setValue("addressEnabled", true)
    if (rootError) {
      setError("root", { type: "manual" })
      return
    }
    if (!errorField) return

    setError(errorField, {
      type: "manual",
      message: `Validation failed for ${errorField}.`,
    })
  }, [errorField, rootError, setError, setValue])

  return (
    <ContactDialogInputs
      dialogState={{ type: "CREATE" }}
      dialogStep="information"
      register={register}
      errors={formState.errors}
      formValues={formValues}
      setValue={setValue}
    />
  )
}

describe("contact dialog input errors", () => {
  afterEach(() => {
    shouldReduceMotion = false
  })

  it.each(ADDRESS_ERROR_FIELDS)(
    "renders the %s validation message",
    async (errorField) => {
      render(<ContactDialogInputsHarness errorField={errorField} />)

      expect(
        await screen.findByText(`Validation failed for ${errorField}.`),
      ).toBeInTheDocument()
    },
  )

  it("associates an invalid field with its own message", async () => {
    render(<ContactDialogInputsHarness errorField="streetAddress" />)

    const validationMessage = await screen.findByText(
      "Validation failed for streetAddress.",
    )
    const streetAddressInput = screen.getByRole("textbox", {
      name: "Street Address",
    })

    expect(validationMessage).toHaveAttribute("id", "streetAddress-error")
    expect(streetAddressInput).toHaveAttribute("aria-invalid", "true")
    expect(streetAddressInput).toHaveAttribute(
      "aria-describedby",
      "streetAddress-error",
    )
  })

  it("does not describe valid fields as invalid", async () => {
    render(<ContactDialogInputsHarness />)

    const emailInput = await screen.findByRole("textbox", {
      name: "Email Address",
    })

    expect(emailInput).not.toHaveAttribute("aria-invalid")
    expect(emailInput).not.toHaveAttribute("aria-describedby")
  })

  it("uses a reduced-motion-safe transition while preference is unresolved", async () => {
    shouldReduceMotion = null

    render(<ContactDialogInputsHarness errorField="streetAddress" />)

    expect(
      await screen.findByRole("region", { name: "Contact information" }),
    ).toBeInTheDocument()
  })

  it("renders the fallback message for a root form error", async () => {
    render(<ContactDialogInputsHarness errorField="streetAddress" rootError />)

    expect(
      await screen.findByText("Please correct the highlighted field."),
    ).toBeInTheDocument()
  })
})
