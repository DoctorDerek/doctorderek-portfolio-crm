import { getErrorMessage } from "@/utils/errors"

export default function transformBirthday({
  birthYear,
  birthMonth,
  birthDay,
}: {
  birthYear?: string
  birthMonth?: string
  birthDay?: string
}) {
  if (!(birthYear && birthMonth && birthDay)) return ""
  try {
    const date = new Date(`${birthYear}-${birthMonth}-${birthDay}`)

    date.setUTCHours(12, 0, 0, 0)
    return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date)
  } catch (error) {
    console.error(getErrorMessage(error))
    return `Invalid date: ${birthYear}-${birthMonth}-${birthDay}`
  }
}
