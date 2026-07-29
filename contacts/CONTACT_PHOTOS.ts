import type { StaticImageData } from "next/image"
import jessicaChristianPortrait from "@/assets/contacts/jessica-christian.webp"
import liaBekyanPortrait from "@/assets/contacts/lia-bekyan.webp"
import remyLozPortrait from "@/assets/contacts/remy-loz.webp"
import ryanHoffmanPortrait from "@/assets/contacts/ryan-hoffman.webp"
import tadasPetrokasPortrait from "@/assets/contacts/tadas-petrokas.webp"
import yohanMarionPortrait from "@/assets/contacts/yohan-marion.webp"

const contactPortraitByPersistedPhotoIdentifier = {
  "Unsplash Jessica Christian.png": jessicaChristianPortrait,
  "Unsplash Lia Bekyan.png": liaBekyanPortrait,
  "Unsplash Remy Loz.png": remyLozPortrait,
  "Unsplash Ryan Hoffman.png": ryanHoffmanPortrait,
  "Unsplash Tadas Petrokas.png": tadasPetrokasPortrait,
  "Unsplash Yohan Marion.png": yohanMarionPortrait,
} as const satisfies Record<string, StaticImageData>

type ContactPhotoIdentifier =
  keyof typeof contactPortraitByPersistedPhotoIdentifier

function isContactPhotoIdentifier(
  photoIdentifier: string,
): photoIdentifier is ContactPhotoIdentifier {
  return Object.hasOwn(
    contactPortraitByPersistedPhotoIdentifier,
    photoIdentifier,
  )
}

export default function getContactPortrait(photoIdentifier?: string) {
  if (!photoIdentifier || !isContactPhotoIdentifier(photoIdentifier))
    return undefined

  return contactPortraitByPersistedPhotoIdentifier[photoIdentifier]
}
