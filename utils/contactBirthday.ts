import { Contact } from "@/types/Contact"

export type ContactBirthday = Pick<
  Contact,
  "birthYear" | "birthMonth" | "birthDay"
>

export default function parseContactBirthday({
  birthYear,
  birthMonth,
  birthDay,
}: ContactBirthday) {
  if (!(birthYear && birthMonth && birthDay)) return undefined
  if (!/^\d{4}$/.test(birthYear)) return undefined
  if (!/^\d{1,2}$/.test(birthMonth) || !/^\d{1,2}$/.test(birthDay))
    return undefined

  const year = Number(birthYear)
  const month = Number(birthMonth)
  const day = Number(birthDay)
  const date = new Date(Date.UTC(year, month - 1, day, 12))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return undefined

  return date
}
