"use client"

import { Dialog } from "@headlessui/react"
import ContactDialogClose from "@/components/ButtonCloseDialog"
import ContactDialogButtons from "@/components/ContactDialogButtons"
import ContactDialogDescription from "@/components/ContactDialogDescription"
import ContactDialogInputs from "@/components/ContactDialogInputs"
import ContactDialogTitle from "@/components/ContactDialogTitle"
import ContactDialogWarning from "@/components/ContactDialogWarning"
import { Contact } from "@/types"
import useOnDialogSubmit from "@/utils/useOnDialogSubmit"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react.es"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

export type DialogState = {
  type: "CLOSED" | "CREATE" | "UPDATE" | "DELETE" | "RESET"
  contact?: Contact
}

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
    getValues,
    setValue,
  } = useForm<Contact>({ mode: "onTouched" })

  const closeDialog = () => {
    setDialogState({ type: "CLOSED", contact: undefined })
    reset()
  }

  const { onDialogSubmit } = useOnDialogSubmit({
    dialogState,
    contacts,
    closeDialog,
  })

  const [slideIndex, setSlideIndex] = useState(0)
  const [sliderRef, instanceRef] = useKeenSlider({
    slideChanged() {
      setSlideIndex(instanceRef?.current?.track?.details?.abs || 0)
    },
    created() {
      setSlideIndex(0)
    },
    destroyed() {
      setSlideIndex(0)
    },
    drag: false,
  })

  async function validateSlide() {
    if (slideIndex === 0) {
      await trigger("email")
      await trigger("password")
    }
    if (slideIndex === 1) {
      await trigger("firstName")
      await trigger("lastName")
      await trigger("birthYear")
      await trigger("birthMonth")
      await trigger("birthDay")
      await trigger("streetAddress")
      await trigger("city")
      await trigger("state")
      await trigger("zipCode")
      await trigger("phoneNumber")
    }
    if (slideIndex === 2) {
      await trigger("securityQuestion")
      await trigger("securityQuestionAnswer")
    }
  }

  useEffect(() => {
    async function showSlideWithError() {
      if (slideIndex === 0) return
      if (errors?.email || errors?.password) {
        setSlideIndex(0)
        instanceRef?.current?.moveToIdx(0, true)
      }
      if (slideIndex === 1) return
      if (
        errors?.firstName ||
        errors?.lastName ||
        errors?.birthYear ||
        errors?.birthMonth ||
        errors?.birthDay ||
        errors?.streetAddress ||
        errors?.city ||
        errors?.state ||
        errors?.zipCode ||
        errors?.phoneNumber
      ) {
        setSlideIndex(1)
        instanceRef?.current?.moveToIdx(1, true)
      }
      if (slideIndex === 2) return
      if (errors?.securityQuestion || errors?.securityQuestionAnswer) {
        setSlideIndex(2)
        instanceRef?.current?.moveToIdx(2, true)
      }
    }
    showSlideWithError()
  }, [
    errors?.birthDay,
    errors?.birthMonth,
    errors?.birthYear,
    errors?.city,
    errors?.email,
    errors?.firstName,
    errors?.lastName,
    errors?.password,
    errors?.phoneNumber,
    errors?.securityQuestion,
    errors?.securityQuestionAnswer,
    errors?.state,
    errors?.streetAddress,
    errors?.zipCode,
    instanceRef,
    slideIndex,
    trigger,
  ])

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

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <form onSubmit={handleSubmit(onDialogSubmit)}>
          <Dialog.Panel className="relative mx-auto flex min-h-[75vh] max-w-lg flex-col justify-between space-y-4 rounded-lg bg-gray-100 p-6 text-lg dark:bg-gray-800">
            <div>
              <ContactDialogClose closeDialog={closeDialog} />
              <ContactDialogTitle dialogState={dialogState} />
              <ContactDialogDescription dialogState={dialogState} />
              <ContactDialogWarning dialogState={dialogState} />
            </div>
            <div ref={sliderRef} className="keen-slider">
              <ContactDialogInputs
                dialogState={dialogState}
                register={register}
                errors={errors}
                getValues={getValues}
                setValue={setValue}
              />
            </div>
            <div
              onClick={() => validateSlide()}
              onKeyDown={(e) => {
                if (e.key === "Enter") validateSlide()
              }}
              role="button"
              tabIndex={0}
            >
              <ContactDialogButtons
                dialogState={dialogState}
                closeDialog={closeDialog}
                instanceRef={instanceRef}
                slideIndex={slideIndex}
              />
            </div>
          </Dialog.Panel>
        </form>
      </div>
    </Dialog>
  )
}
