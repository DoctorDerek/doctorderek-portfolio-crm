import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import { Contact } from "@/types/Contact"

export default function ButtonFavorite({
  contact,
  onToggleFavorite,
}: {
  contact: Contact
  onToggleFavorite: (contact: Contact) => void
}) {
  const contactName = `${contact.firstName} ${contact.lastName}`
  const label = contact.isFavorite
    ? `Remove ${contactName} from favorites`
    : `Add ${contactName} to favorites`
  const StarIcon = contact.isFavorite ? StarIconSolid : StarIconOutline

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={Boolean(contact.isFavorite)}
      title={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-600 dark:text-amber-300 dark:hover:bg-amber-950 dark:hover:text-amber-200"
      onClick={() => onToggleFavorite(contact)}
    >
      <StarIcon className="h-6 w-6" aria-hidden="true" />
    </button>
  )
}
