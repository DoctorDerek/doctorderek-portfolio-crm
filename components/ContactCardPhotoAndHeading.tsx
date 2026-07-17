import { UserIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import { Dispatch, SetStateAction } from "react"
import ButtonDelete from "@/components/ButtonDelete"
import ContactCardName from "@/components/ContactCardName"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"

export const IMAGE_SIZES =
  "(max-width: 640px) 5rem, (max-width: 1280px) 5rem, 5rem"

export default function ContactCardPhotoAndHeading({
  contact,
  setDialogState,
}: {
  contact: Contact
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  const { firstName, lastName, photo } = contact || {
    firstName: "",
    lastName: "",
    photo: "",
  }
  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="group relative h-20 w-20 shrink-0">
        {photo && (
          <Image
            src={`/contacts/${photo}`}
            alt={`${firstName} ${lastName}`}

            fill
            className="object-fit rounded-full"
            sizes={IMAGE_SIZES}
          />
        )}
        {!photo && (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-300 dark:bg-gray-200">
            <UserIcon className="h-3/4 w-3/4 text-gray-100 dark:text-gray-400" />
          </div>
        )}
        <div className="invisible absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform group-hover:visible">
          <ButtonDelete contact={contact} setDialogState={setDialogState} />
        </div>
      </div>
      <ContactCardName contact={contact} setDialogState={setDialogState} />
    </div>
  )
}
