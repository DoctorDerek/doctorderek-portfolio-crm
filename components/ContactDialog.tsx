"use client"

import { Dialog } from "@headlessui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import ContactDialogClose from "@/components/ButtonCloseDialog"
import ContactDialogButtons from "@/components/ContactDialogButtons"
import ContactDialogDescription from "@/components/ContactDialogDescription"
import ContactDialogInputs from "@/components/ContactDialogInputs"
import ContactDialogTitle from "@/components/ContactDialogTitle"
import ContactDialogWarning from "@/components/ContactDialogWarning"
import { ContactDialogStep } from "@/contacts/CONTACT_DIALOG_STEPS"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
import {
  contactFormSchema,
  ContactFormValues,
  getContactFormDefaultValues,
} from "@/utils/contactForm"
import useOnDialogSubmit from "@/utils/useOnDialogSubmit"

export default function ContactDialog({
  dialogState,
  setDialogState,
  contacts,
}: {
  dialogState: DialogState
  setDialogState: Dispatch<SetStateAction<DialogState>>
  contacts: Contact[]
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    setValue,
    control,
  } = useForm<ContactFormValues>({
    mode: "onTouched",
    resolver:
      dialogState.type === "CREATE" || dialogState.type === "UPDATE"
        ? zodResolver(contactFormSchema)
        : undefined,
    defaultValues: getContactFormDefaultValues(dialogState),
  })
  const formValues = useWatch({
    control,
    compute: (completeFormValues) => completeFormValues,
  })
  const [dialogStep, setDialogStep] = useState<ContactDialogStep>("information")

  useEffect(() => {
    reset(getContactFormDefaultValues(dialogState))
  }, [dialogState, reset])

  const closeDialog = () => {
    setDialogStep("information")
    setDialogState({ type: "CLOSED" })
    reset()
  }

  const { onDialogSubmit } = useOnDialogSubmit({
    dialogState,
    contacts,
    closeDialog,
  })
  const submitDialog = handleSubmit(onDialogSubmit, () => {
    setDialogStep("information")
  })

  function validateStep() {
    return trigger(
      [
        "email",
        "firstName",
        "lastName",
        "birthYear",
        "birthMonth",
        "birthDay",
        "streetAddress",
        "city",
        "state",
        "zipCode",
        "phoneNumber",
      ],
      { shouldFocus: true },
    )
  }

  return (
    <Dialog
      open={dialogState.type !== "CLOSED"}
      onClose={closeDialog}
      className="relative z-50"
    >
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/70"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <form onSubmit={submitDialog} className="w-full max-w-lg min-w-0">
          <Dialog.Panel className="relative mx-auto flex max-h-[calc(100dvh-2rem)] min-h-[75vh] w-full min-w-0 flex-col justify-between space-y-4 overflow-y-auto rounded-lg bg-gray-100 p-4 text-lg wrap-anywhere sm:p-6 dark:bg-gray-800">
            <div className="pt-6">
              <ContactDialogClose closeDialog={closeDialog} />
              <ContactDialogTitle dialogState={dialogState} />
              <ContactDialogDescription dialogState={dialogState} />
              <ContactDialogWarning dialogState={dialogState} />
            </div>
            <ContactDialogInputs
              dialogState={dialogState}
              dialogStep={dialogStep}
              register={register}
              errors={errors}
              formValues={formValues}
              setValue={setValue}
            />
            <ContactDialogButtons
              dialogState={dialogState}
              closeDialog={closeDialog}
              dialogStep={dialogStep}
              showStep={setDialogStep}
              submitDialog={() => void submitDialog()}
              validateStep={validateStep}
            />
          </Dialog.Panel>
        </form>
      </div>
    </Dialog>
  )
}
