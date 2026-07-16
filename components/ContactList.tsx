import { Dispatch, SetStateAction } from "react"
import ContactCard from "@/components/ContactCard"
import { Contact, DialogState } from "@/types"
import useFilterByAgeRange from "@/utils/useFilterByAgeRange"

export default function ContactList({
  contacts,
  filterText,
  setDialogState,
}: {
  contacts: Contact[]
  filterText: string
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  const { filterByAgeRange } = useFilterByAgeRange({ filterText })
  const filteredPhoneBookEntries = contacts?.filter(filterByAgeRange)

  return (
    <div className="relative w-full space-y-6">
      {filteredPhoneBookEntries?.map((contact) => {
        const { id, firstName, lastName, phoneNumber, photo } = contact

        const key = `${id}${firstName}${lastName}${phoneNumber}${photo}`
        return (
          <ContactCard
            key={key}
            contact={contact}
            setDialogState={setDialogState}
          />
        )
      })}
    </div>
  )
}
