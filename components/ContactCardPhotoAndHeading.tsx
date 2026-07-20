import { UserIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import { Dispatch, SetStateAction } from "react"
import ButtonDelete from "@/components/ButtonDelete"
import ButtonFavorite from "@/components/ButtonFavorite"
import ContactCardName from "@/components/ContactCardName"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"

export const IMAGE_SIZES =
  "(max-width: 640px) 5rem, (max-width: 1280px) 5rem, 5rem"

export default function ContactCardPhotoAndHeading({
  contact,
  setDialogState,
  onToggleFavorite,
}: {
  contact: Contact
  setDialogState: Dispatch<SetStateAction<DialogState>>
  onToggleFavorite?: (contact: Contact) => void
}) {
  const { firstName, lastName, photo } = contact || {
    firstName: "",
    lastName: "",
    photo: "",
  }
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
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
        </div>
        <ContactCardName contact={contact} setDialogState={setDialogState} />
      </div>
      {onToggleFavorite && (
        <div className="flex items-center gap-1 self-end sm:self-start">
          <ButtonFavorite
            contact={contact}
            onToggleFavorite={onToggleFavorite}
          />
          <ButtonDelete contact={contact} setDialogState={setDialogState} />
        </div>
      )}
    </div>
  )
}
