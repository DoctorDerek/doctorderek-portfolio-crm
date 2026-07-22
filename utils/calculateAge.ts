import parseContactBirthday, { ContactBirthday } from "@/utils/contactBirthday"

export const calculateAge = ({
  birthYear,
  birthMonth,
  birthDay,
}: ContactBirthday) => {
  const birthDate = parseContactBirthday({
    birthYear,
    birthMonth,
    birthDay,
  })
  if (!birthDate) return undefined

  const today = new Date()
  const age = today.getFullYear() - birthDate.getUTCFullYear()
  const month = today.getMonth() - birthDate.getUTCMonth()
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getUTCDate())) {
    return age - 1
  }
  return age
}
