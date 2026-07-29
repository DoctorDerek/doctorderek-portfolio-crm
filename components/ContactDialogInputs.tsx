import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ReactNode } from "react"
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form"
import ContactCard from "@/components/ContactCard"
import ContactDialogToggle from "@/components/ContactDialogToggle"
import { ContactDialogStep } from "@/contacts/CONTACT_DIALOG_STEPS"
import { DialogState } from "@/types/DialogState"
import classNames from "@/utils/classNames"
import {
  buildContactFromFormValues,
  ContactFormValues,
} from "@/utils/contactForm"

type ContactFormFieldName = Exclude<keyof ContactFormValues, "addressEnabled">

function ContactDialogInput({
  label,
  fieldName,
  register,
  errors,
  disabled,
  placeholder,
}: {
  label: string
  fieldName: ContactFormFieldName
  register: UseFormRegister<ContactFormValues>
  errors: FieldErrors<ContactFormValues>
  disabled?: boolean
  placeholder?: string
}) {
  const errorMessage = errors[fieldName]?.message
  const errorMessageId = `${fieldName}-error`

  const getInputType = () => {
    if (fieldName === "email") return "email"
    if (fieldName === "phoneNumber") return "tel"
    return "text"
  }

  return (
    <div className="relative mt-4">
      <label
        htmlFor={fieldName}
        className="absolute -top-3 left-3 inline-block bg-white px-1 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      >
        {label}
      </label>
      <input
        type={getInputType()}
        id={fieldName}
        className={classNames(
          "block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:ring-gray-700 dark:focus:ring-gray-500 dark:disabled:bg-gray-950 dark:disabled:text-gray-800 dark:disabled:ring-gray-950",
          errors[fieldName] ? "ring-2 ring-red-500 dark:ring-red-900" : "",
        )}
        placeholder={placeholder}
        aria-describedby={errorMessage ? errorMessageId : undefined}
        aria-invalid={errorMessage ? true : undefined}
        {...register(fieldName)}
        disabled={disabled}
      />
      {errorMessage && (
        <p id={errorMessageId} className="mt-2 text-sm text-red-500">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default function ContactDialogInputs({
  dialogState,
  dialogStep,
  register,
  errors,
  formValues,
  setValue,
}: {
  dialogState: DialogState
  dialogStep: ContactDialogStep
  register: UseFormRegister<ContactFormValues>
  errors: FieldErrors<ContactFormValues>
  formValues: ContactFormValues
  setValue: UseFormSetValue<ContactFormValues>
}) {
  const shouldReduceMotion = useReducedMotion() ?? true

  if (dialogState.type === "RESET") return null

  if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE")
    return null

  const reviewContact = buildContactFromFormValues(formValues, {
    id: dialogState.type === "UPDATE" ? dialogState.contact.id : 0,
    photo:
      dialogState.type === "UPDATE" ? dialogState.contact.photo : undefined,
    isFavorite:
      dialogState.type === "UPDATE"
        ? dialogState.contact.isFavorite
        : undefined,
  })

  const dialogStepContent = {
    information: (
      <section aria-labelledby="contact-information-step-title">
        <h3 id="contact-information-step-title" className="sr-only">
          Contact information
        </h3>
        <ContactDialogInput
          label="Email Address"
          fieldName="email"
          register={register}
          errors={errors}
        />
        <ContactDialogInput
          label="First Name"
          fieldName="firstName"
          register={register}
          errors={errors}
        />
        <ContactDialogInput
          label="Last Name"
          fieldName="lastName"
          register={register}
          errors={errors}
        />
        <ContactDialogInput
          label="Date of Birth - Month"
          fieldName="birthMonth"
          register={register}
          errors={errors}
          placeholder="MM"
        />
        <ContactDialogInput
          label="Date of Birth - Day"
          fieldName="birthDay"
          register={register}
          errors={errors}
          placeholder="DD"
        />
        <ContactDialogInput
          label="Date of Birth - Year"
          fieldName="birthYear"
          register={register}
          errors={errors}
          placeholder="YYYY"
        />
        <ContactDialogInput
          label="Phone Number"
          fieldName="phoneNumber"
          register={register}
          errors={errors}
        />
        <ContactDialogToggle
          addressEnabled={formValues.addressEnabled}
          onAddressEnabledChange={(addressEnabled) =>
            setValue("addressEnabled", addressEnabled, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <ContactDialogInput
          label="Street Address"
          fieldName="streetAddress"
          register={register}
          errors={errors}
          disabled={!formValues.addressEnabled}
        />
        <ContactDialogInput
          label="City"
          fieldName="city"
          register={register}
          errors={errors}
          disabled={!formValues.addressEnabled}
        />
        <ContactDialogInput
          label="State"
          fieldName="state"
          register={register}
          errors={errors}
          disabled={!formValues.addressEnabled}
        />
        <ContactDialogInput
          label="ZIP Code"
          fieldName="zipCode"
          register={register}
          errors={errors}
          disabled={!formValues.addressEnabled}
        />
        {errors.root && (
          <p role="alert" className="mt-2 text-red-500">
            {errors.root.message ?? "Please correct the highlighted field."}
          </p>
        )}
      </section>
    ),
    review: (
      <section
        aria-labelledby="contact-review-step-title"
        className="space-y-4 text-sm"
      >
        <h3
          id="contact-review-step-title"
          className="text-base font-bold italic"
        >
          Review and Submit
        </h3>
        <ContactCard contact={reviewContact} />
      </section>
    ),
  } satisfies Record<ContactDialogStep, ReactNode>

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={dialogStep}
        aria-live="polite"
        initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, x: -24 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      >
        {dialogStepContent[dialogStep]}
      </motion.div>
    </AnimatePresence>
  )
}
