import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
} from "@heroicons/react/24/solid"
import Image from "next/image"
import { Dispatch, PointerEvent, SetStateAction } from "react"
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
  onMoveContact,
  onDragStart,
  isFirst,
  isLast,
}: {
  contact: Contact
  setDialogState?: Dispatch<SetStateAction<DialogState>>
  onToggleFavorite?: (contact: Contact) => void
  onDragStart?: (event: PointerEvent) => void
  onMoveContact?: (contact: Contact, direction: "up" | "down") => void
  isFirst?: boolean
  isLast?: boolean
}) {
  const { firstName, lastName, photo } = contact || {
    firstName: "",
    lastName: "",
    photo: "",
  }
  const contactName = `${firstName} ${lastName}`
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
      {onToggleFavorite && setDialogState && (
        <div className="flex items-center gap-1 self-end sm:self-start">
          <button
            type="button"
            aria-label={`Reorder ${contactName} by dragging`}
            className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-full border border-dashed border-white/40 text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-700 dark:border-purple-500/50 dark:text-purple-300 dark:hover:bg-purple-950 dark:hover:text-purple-200"
            onPointerDown={(event) => {
              onDragStart?.(event)
            }}
            onPointerUp={(event) => {
              event.currentTarget.blur()
            }}
          >
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Move ${contactName} up`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-purple-300 dark:hover:bg-purple-950 dark:hover:text-purple-200"
            onClick={() => onMoveContact?.(contact, "up")}
            disabled={isFirst}
          >
            <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Move ${contactName} down`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-indigo-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-200"
            onClick={() => onMoveContact?.(contact, "down")}
            disabled={isLast}
          >
            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
          </button>
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
