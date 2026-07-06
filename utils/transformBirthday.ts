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
  // If we don't have a birthday, we have nothing to transform.
  if (!(birthYear && birthMonth && birthDay)) return ""
  try {
    const date = new Date(`${birthYear}-${birthMonth}-${birthDay}`)
    // Avoid local time zone issues by using UTC. Without this, then 03/15/1920
    // could be March 14 or March 15 depending on the time zone.
    date.setUTCHours(12, 0, 0, 0)
    return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date)
  } catch (error) {
    // We are vulnerable to `Uncaught RangeError: Invalid time value` for "".
    console.error(error)
    return `Invalid date: ${birthYear}-${birthMonth}-${birthDay}`
  }
}
