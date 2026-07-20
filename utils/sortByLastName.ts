import { Contact } from "@/types/Contact"

export const sortByLastName = (a: Contact, b: Contact) => {
  const aName = a?.lastName || ""
  const bName = b?.lastName || ""
  const aLastName = aName.split(" ").pop()?.toLocaleLowerCase() || ""
  const bLastName = bName.split(" ").pop()?.toLocaleLowerCase() || ""
  return aLastName.localeCompare(bLastName)
}
