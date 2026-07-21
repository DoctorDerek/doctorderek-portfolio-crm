import { useState } from "react"
import {
  FieldErrorsImpl,
  UseFormGetValues,
  UseFormRegister,
} from "react-hook-form"
import ContactCard from "@/components/ContactCard"
import ContactDialogToggle from "@/components/ContactDialogToggle"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
import classNames from "@/utils/classNames"
import parseContactBirthday from "@/utils/contactBirthday"

function ContactDialogInput({
  label,
  fieldName,
  dialogState,
  register,
  errors,
  getValues,
  disabled,
  addressEnabled,
  placeholder,
}: {
  label: string
  fieldName: keyof Contact
  dialogState: DialogState
  register: UseFormRegister<Contact>
  errors: Partial<FieldErrorsImpl<Contact>>
  getValues: UseFormGetValues<Contact>
  disabled?: boolean
  addressEnabled: boolean
  placeholder?: string
}) {
  const getInputType = () => {
    if (fieldName === "email") return "email"
    if (fieldName === "phoneNumber") return "tel"
    return "text"
  }

  const placeholderWithPreviousValue =
    String(dialogState.contact?.[fieldName] || "") || placeholder
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
        placeholder={placeholderWithPreviousValue}
        {...register(fieldName, {
          validate: (value) => {
            if (dialogState.type !== "CREATE") return true
            if (fieldName === "email") {
              return (
                (typeof value === "string" && value?.includes("@")) ||
                "Please enter a valid email address."
              )
            }
            if (
              fieldName === "firstName" ||
              fieldName === "lastName" ||
              fieldName === "phoneNumber" ||
              fieldName === "birthMonth" ||
              fieldName === "birthDay" ||
              fieldName === "birthYear"
            ) {
              if (!value) return "All fields are required."
            }
            if (fieldName === "birthDay") {
              const birthDay = typeof value === "string" ? value : undefined
              return (
                Boolean(
                  parseContactBirthday({
                    birthYear: getValues("birthYear"),
                    birthMonth: getValues("birthMonth"),
                    birthDay,
                  }),
                ) || "Please enter a valid date of birth."
              )
            }
            if (
              addressEnabled &&
              (fieldName === "streetAddress" ||
                fieldName === "city" ||
                fieldName === "state" ||
                fieldName === "zipCode")
            )
              return Boolean(value) || "All fields are required."
            return true
          },
        })}
        disabled={dialogState.type === "DELETE" || disabled}
      />
    </div>
  )
}

function ErrorMessage({
  errors,
}: {
  errors: Partial<FieldErrorsImpl<Contact>>
}) {
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
      "All fields are required."
    )
  }
  return <div className="mt-2 text-red-500">{getErrorMessage()}</div>
}

export default function ContactDialogInputs({
  dialogState,
  slideIndex,
  register,
  errors,
  getValues,
}: {
  dialogState: DialogState
  slideIndex: number
  register: UseFormRegister<Contact>
  errors: Partial<FieldErrorsImpl<Contact>>
  getValues: UseFormGetValues<Contact>
}) {
  const [addressEnabled, setAddressEnabled] = useState(false)

  if (dialogState.type === "RESET") return null

  if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE")
    return null

  return (
    <>
      <div className="keen-slider__slide" inert={slideIndex !== 0}>
        <ContactDialogInput
          label="Email Address"
          fieldName="email"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          addressEnabled={addressEnabled}
        />
        {dialogState.type === "CREATE" && errors?.email?.message && (
          <ErrorMessage errors={errors} />
        )}
      </div>
      <div className="keen-slider__slide" inert={slideIndex !== 1}>
        <ContactDialogInput
          label="First Name"
          fieldName="firstName"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="Last Name"
          fieldName="lastName"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="Date of Birth - Month"
          fieldName="birthMonth"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          addressEnabled={addressEnabled}
          placeholder="MM"
        />
        <ContactDialogInput
          label="Date of Birth - Day"
          fieldName="birthDay"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          addressEnabled={addressEnabled}
          placeholder="DD"
        />
        <ContactDialogInput
          label="Date of Birth - Year"
          fieldName="birthYear"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          addressEnabled={addressEnabled}
          placeholder="YYYY"
        />
        <ContactDialogInput
          label="Phone Number"
          fieldName="phoneNumber"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          addressEnabled={addressEnabled}
        />
        <ContactDialogToggle
          addressEnabled={addressEnabled}
          setAddressEnabled={setAddressEnabled}
        />
        <ContactDialogInput
          label="Street Address"
          fieldName="streetAddress"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          disabled={!addressEnabled}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="City"
          fieldName="city"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          disabled={!addressEnabled}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="State"
          fieldName="state"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          disabled={!addressEnabled}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="ZIP Code"
          fieldName="zipCode"
          dialogState={dialogState}
          register={register}
          errors={errors}
          getValues={getValues}
          disabled={!addressEnabled}
          addressEnabled={addressEnabled}
        />
        {dialogState.type === "CREATE" &&
          (errors?.firstName?.message ||
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
        <ContactCard contact={getValues()} setDialogState={() => {}} />
      </div>
    </>
  )
}
