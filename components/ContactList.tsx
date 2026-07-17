import { Dispatch, SetStateAction } from "react"
import ContactCard from "@/components/ContactCard"
import { Contact } from "@/types/Contact"
import { ContactFilters } from "@/types/ContactFilters"
import { DialogState } from "@/types/DialogState"
import filterContacts from "@/utils/filterContacts"

export default function ContactList({
  contacts,
  contactFilters,
  setDialogState,
}: {
  contacts: Contact[]
  contactFilters: ContactFilters
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  const filteredPhoneBookEntries = filterContacts(contacts, contactFilters)

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
