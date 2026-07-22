import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form"
import ContactCard from "@/components/ContactCard"
import ContactDialogToggle from "@/components/ContactDialogToggle"
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
        {...register(fieldName)}
        disabled={disabled}
      />
    </div>
  )
}

function ErrorMessage({ errors }: { errors: FieldErrors<ContactFormValues> }) {
  const getErrorMessage = () => {
    return (
      errors?.email?.message ||
      errors?.firstName?.message ||
      errors?.lastName?.message ||
      errors?.birthMonth?.message ||
      errors?.birthDay?.message ||
      errors?.birthYear?.message ||
      errors?.phoneNumber?.message ||
      errors?.streetAddress?.message ||
      errors?.city?.message ||
      errors?.state?.message ||
      errors?.zipCode?.message ||
      "Please correct the highlighted field."
    )
  }
  return <div className="mt-2 text-red-500">{getErrorMessage()}</div>
}

export default function ContactDialogInputs({
  dialogState,
  slideIndex,
  register,
  errors,
  formValues,
  setValue,
}: {
  dialogState: DialogState
  slideIndex: number
  register: UseFormRegister<ContactFormValues>
  errors: FieldErrors<ContactFormValues>
  formValues: ContactFormValues
  setValue: UseFormSetValue<ContactFormValues>
}) {
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

  return (
    <>
      <div className="keen-slider__slide" inert={slideIndex !== 0}>
        <ContactDialogInput
          label="Email Address"
          fieldName="email"
          register={register}
          errors={errors}
        />
        {errors?.email?.message && <ErrorMessage errors={errors} />}
      </div>
      <div className="keen-slider__slide" inert={slideIndex !== 1}>
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
        {(errors?.firstName?.message ||
          errors?.lastName?.message ||
          errors?.birthMonth?.message ||
          errors?.birthDay?.message ||
          errors?.birthYear?.message ||
          errors?.phoneNumber?.message ||
          errors?.streetAddress?.message ||
          errors?.city?.message ||
          errors?.state?.message ||
          errors?.zipCode?.message) && <ErrorMessage errors={errors} />}
      </div>
      <div
        className="keen-slider__slide space-y-4 text-sm"
        inert={slideIndex !== 2}
      >
        <div className="text-base font-bold italic">Review and Submit</div>
        <ContactCard contact={reviewContact} />
      </div>
    </>
  )
}
