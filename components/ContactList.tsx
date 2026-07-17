import { Dispatch, SetStateAction } from "react"
import ContactCard from "@/components/ContactCard"
import ContactListEmptyState from "@/components/ContactListEmptyState"
import ContactResultsSummary from "@/components/ContactResultsSummary"
import { Contact } from "@/types/Contact"
import { ContactFilters } from "@/types/ContactFilters"
import { DialogState } from "@/types/DialogState"
import filterContacts from "@/utils/filterContacts"

export default function ContactList({
  contacts,
  contactFilters,
  setDialogState,
  onToggleFavorite,
}: {
  contacts: Contact[]
  contactFilters: ContactFilters
  setDialogState: Dispatch<SetStateAction<DialogState>>
  onToggleFavorite: (contact: Contact) => void
}) {
  const filteredPhoneBookEntries = filterContacts(contacts, contactFilters)

  return (
    <section
      className="relative w-full space-y-4"
      aria-label="Contact results"
    >
      <ContactResultsSummary
        filteredContactCount={filteredPhoneBookEntries.length}
        totalContactCount={contacts.length}
      />
      <div className="space-y-6">
        {filteredPhoneBookEntries.length === 0 && (
          <ContactListEmptyState hasContacts={contacts.length > 0} />
        )}
        {filteredPhoneBookEntries.map((contact) => {
          const { id, firstName, lastName, phoneNumber, photo } = contact

          const key = `${id}${firstName}${lastName}${phoneNumber}${photo}`
          return (
            <ContactCard
              key={key}
              contact={contact}
              setDialogState={setDialogState}
              onToggleFavorite={onToggleFavorite}
            />
          )
        })}
      </div>
    </section>
  )
}
