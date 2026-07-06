/**
 * Takes a birthday string such as "1920-03-15" and returns "Month Day, Year".
 * e.g. "1920-03-15" => "March 15, 1920"
 * */
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
    
    console.error(error)
    return `Invalid date: ${birthYear}-${birthMonth}-${birthDay}`
  }
}
