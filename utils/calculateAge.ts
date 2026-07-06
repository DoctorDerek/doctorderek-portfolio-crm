export const calculateAge = ({
  birthYear,
  birthMonth,
  birthDay,
}: {
  birthYear?: string
  birthMonth?: string
  birthDay?: string
}) => {
  if (!(birthYear && birthMonth && birthDay)) return undefined
  const today = new Date()
  const birthDate = new Date(`${birthYear}-${birthMonth}-${birthDay}`)
  const age = today.getFullYear() - birthDate.getFullYear()
  const month = today.getMonth() - birthDate.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1
  }
  return age
}
