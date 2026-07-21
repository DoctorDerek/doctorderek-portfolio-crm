import parseContactBirthday, { ContactBirthday } from "@/utils/contactBirthday"

export default function transformBirthday({
  birthYear,
  birthMonth,
  birthDay,
}: ContactBirthday) {
  if (!(birthYear && birthMonth && birthDay)) return ""
  const date = parseContactBirthday({ birthYear, birthMonth, birthDay })
  if (!date) return `Invalid date: ${birthYear}-${birthMonth}-${birthDay}`

  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date)
}
