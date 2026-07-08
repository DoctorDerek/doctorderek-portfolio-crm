import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import {
  FieldErrorsImpl,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetError,
  UseFormSetValue,
} from "react-hook-form"
import ContactCard from "@/components/ContactCard"
import ContactDialogSecurityQuestions from "@/components/ContactDialogSecurityQuestions"
import ContactDialogToggle from "@/components/ContactDialogToggle"
import { Contact, DialogState } from "@/types"
import classNames from "@/utils/classNames"

/**
 * The `<ContactDialogInput>` renders the input fields for `<ContactDialog>`.
 *
 * All fields are required
 *
 * We have some simple validation rules for the email and password fields.
 *
 * Note that we don't try to validate a phone number, because formats for
 * telephone numbers vary so much around the world. For example, many
 * validations for telephone numbers will reject any country code, such as
 * +1 for United States, even though valid US phone numbers start with +1.
 * */
function ContactDialogInput({
  label,
  fieldName,
  dialogState,
  register,
  errors,
  disabled,
  addressEnabled,
  placeholder,
}: {
  label: string
  fieldName: keyof Contact
  dialogState: DialogState
  register: UseFormRegister<Contact>
  errors: Partial<FieldErrorsImpl<Contact>>
  disabled?: boolean
  /** The address fields are only enabled when the user toggles them on. */
  addressEnabled: boolean
  placeholder?: string
}) {
  /**
   * Note that we don't want to use the "date" input for birthday, because it
   * is extremely difficult to use on Android for selecting your birthday. */
  const getInputType = () => {
    if (fieldName === "password") return "password"
    if (fieldName === "email") return "email"
    if (fieldName === "phoneNumber") return "tel"
    return "text"
  }

  /** For the UPDATE dialog, check for undefined and then coerce to a string. */
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
            if (fieldName === "password") {
              if (typeof value === "string" && value?.length < 8)
                return "Please enter a password of at least 8 characters."

              if (typeof value === "string" && !/\d/.test(value))
                return "Please enter a password with at least one number."

              if (typeof value === "string" && !/[!@#$%^&*]/.test(value))
                return "Please enter a password with at least one symbol."
              return true
            }
            if (
              fieldName === "firstName" ||
              fieldName === "lastName" ||
              fieldName === "phoneNumber" ||
              fieldName === "birthMonth" ||
              fieldName === "birthDay" ||
              fieldName === "birthYear" ||
              fieldName === "securityQuestion" ||
              fieldName === "securityQuestionAnswer"
            )
              return Boolean(value) || "All fields are required."
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
      errors?.password?.message ||
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
      errors?.securityQuestion?.message ||
      errors?.securityQuestionAnswer?.message ||
      "All fields are required."
    )
  }
  return <div className="mt-2 text-red-500">{getErrorMessage()}</div>
}

/** This is the "interior" of the form, where the user inputs data. */
export default function ContactDialogInputs({
  dialogState,
  register,
  errors,
  getValues,
  setValue,
}: {
  dialogState: DialogState
  register: UseFormRegister<Contact>
  errors: Partial<FieldErrorsImpl<Contact>>
  getValues: UseFormGetValues<Contact>
  setValue: UseFormSetValue<Contact>
}) {
  const [addressEnabled, setAddressEnabled] = useState(false)

  if (dialogState.type === "RESET") return null

  if (dialogState.type !== "CREATE" && dialogState.type !== "UPDATE")
    return null

  return (
    <>
      <div className="keen-slider__slide">
        <ContactDialogInput
          label="Email Address"
          fieldName="email"
          dialogState={dialogState}
          register={register}
          errors={errors}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="Password"
          fieldName="password"
          dialogState={dialogState}
          register={register}
          errors={errors}
          addressEnabled={addressEnabled}
        />
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center">
            {(getValues("password")?.length || 0) >= 8 && (
              <CheckIcon className="ml-2 h-5 w-5 text-green-500" />
            )}
            {(getValues("password")?.length || 0) < 8 && (
              <XMarkIcon className="ml-2 h-5 w-5 text-red-500" />
            )}
            <span className="ml-2">At least 8 characters</span>
          </div>
          <div className="flex items-center">
            {/\d/.test(String(getValues("password"))) && (
              <CheckIcon className="ml-2 h-5 w-5 text-green-500" />
            )}
            {!/\d/.test(String(getValues("password"))) && (
              <XMarkIcon className="ml-2 h-5 w-5 text-red-500" />
            )}
            <span className="ml-2">At least 1 number</span>
          </div>
          <div className="flex items-center">
            {/[!@#$%^&*]/.test(String(getValues("password"))) && (
              <CheckIcon className="ml-2 h-5 w-5 text-green-500" />
            )}
            {!/[!@#$%^&*]/.test(String(getValues("password"))) && (
              <XMarkIcon className="ml-2 h-5 w-5 text-red-500" />
            )}
            <span className="ml-2">At least 1 symbol</span>
          </div>
        </div>
        <div className="pt-4 text-base italic">
          Note: The password is only to demonstrate password validation. Do not
          use a real password.
        </div>
        {dialogState.type === "CREATE" &&
          (errors?.email?.message || errors?.password?.message) && (
            <ErrorMessage errors={errors} />
          )}
      </div>
      <div className="keen-slider__slide">
        <ContactDialogInput
          label="First Name"
          fieldName="firstName"
          dialogState={dialogState}
          register={register}
          errors={errors}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="Last Name"
          fieldName="lastName"
          dialogState={dialogState}
          register={register}
          errors={errors}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="Date of Birth - Month"
          fieldName="birthMonth"
          dialogState={dialogState}
          register={register}
          errors={errors}
          addressEnabled={addressEnabled}
          placeholder="MM"
        />
        <ContactDialogInput
          label="Date of Birth - Day"
          fieldName="birthDay"
          dialogState={dialogState}
          register={register}
          errors={errors}
          addressEnabled={addressEnabled}
          placeholder="DD"
        />
        <ContactDialogInput
          label="Date of Birth - Year"
          fieldName="birthYear"
          dialogState={dialogState}
          register={register}
          errors={errors}
          addressEnabled={addressEnabled}
          placeholder="YYYY"
        />
        <ContactDialogInput
          label="Phone Number"
          fieldName="phoneNumber"
          dialogState={dialogState}
          register={register}
          errors={errors}
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
          disabled={!addressEnabled}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="City"
          fieldName="city"
          dialogState={dialogState}
          register={register}
          errors={errors}
          disabled={!addressEnabled}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="State"
          fieldName="state"
          dialogState={dialogState}
          register={register}
          errors={errors}
          disabled={!addressEnabled}
          addressEnabled={addressEnabled}
        />
        <ContactDialogInput
          label="ZIP Code"
          fieldName="zipCode"
          dialogState={dialogState}
          register={register}
          errors={errors}
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
      <div className="keen-slider__slide space-y-8">
        <ContactDialogSecurityQuestions
          setValue={setValue}
          errors={errors}
          register={register}
        />
        <ContactDialogInput
          label="Security Question Answer"
          fieldName="securityQuestionAnswer"
          dialogState={dialogState}
          register={register}
          errors={errors}
          addressEnabled={addressEnabled}
        />
        <div className="pt-4 text-base italic">
          Note: The security question is only for demonstration purposes. Do not
          use a real security question.
        </div>
        {dialogState.type === "CREATE" &&
          (errors?.securityQuestion?.message ||
            errors?.securityQuestionAnswer?.message) && (
            <ErrorMessage errors={errors} />
          )}
      </div>
      <div className="keen-slider__slide space-y-4 text-sm">
        <div className="text-base font-bold italic">Review and Submit</div>
        <ContactCard contact={getValues()} setDialogState={() => {}} />
        <div className="pb-4 text-base font-bold italic">Security Question</div>
        <span className="italic">{getValues("securityQuestion")}</span>
        <span className="font-bold">
          {" "}
          {getValues("securityQuestionAnswer")}
        </span>
      </div>
    </>
  )
}
