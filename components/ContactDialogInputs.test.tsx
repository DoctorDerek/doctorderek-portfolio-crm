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
  errorField: AddressErrorField
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
    if (rootError) {
      setError("root", { type: "manual" })
      return
    }
    setError(errorField, {
      type: "manual",
      message: `Validation failed for ${errorField}.`,
    })
  }, [errorField, rootError, setError])

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
