"use client"

import { Dialog } from "@headlessui/react"
import ContactDialogClose from "@/components/ButtonCloseDialog"
import ContactDialogButtons from "@/components/ContactDialogButtons"
import ContactDialogDescription from "@/components/ContactDialogDescription"
import ContactDialogInputs from "@/components/ContactDialogInputs"
import ContactDialogTitle from "@/components/ContactDialogTitle"
import ContactDialogWarning from "@/components/ContactDialogWarning"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
import useOnDialogSubmit from "@/utils/useOnDialogSubmit"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react.es"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

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
  const submitDialog = handleSubmit(onDialogSubmit)

  const [slideIndex, setSlideIndex] = useState(0)
  const [sliderRef, instanceRef] = useKeenSlider({
    created() {
      setSlideIndex(0)
    },
    destroyed() {
      setSlideIndex(0)
    },
    drag: false,
  })

  const showSlide = (nextSlideIndex: number) => {
    setSlideIndex(nextSlideIndex)
    instanceRef.current?.moveToIdx(nextSlideIndex, true)
  }

  function validateSlide() {
    if (slideIndex === 0) return trigger("email")
    if (slideIndex === 1)
      return trigger([
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
      ])
    return Promise.resolve(true)
  }

  useEffect(() => {
    async function showSlideWithError() {
      if (slideIndex === 0) return
      if (errors?.email) {
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
    errors?.phoneNumber,
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
        <form onSubmit={submitDialog}>
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
                slideIndex={slideIndex}
                register={register}
                errors={errors}
                getValues={getValues}
              />
            </div>
            <ContactDialogButtons
              dialogState={dialogState}
              closeDialog={closeDialog}
              slideIndex={slideIndex}
              showSlide={showSlide}
              submitDialog={() => void submitDialog()}
              validateSlide={validateSlide}
            />
          </Dialog.Panel>
        </form>
      </div>
    </Dialog>
  )
}
