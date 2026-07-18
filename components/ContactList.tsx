import { AnimatePresence, motion } from "motion/react"
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
        <AnimatePresence initial={false} mode="popLayout">
          {filteredPhoneBookEntries.length === 0 && (
            <motion.div
              key="contact-list-empty-state"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <ContactListEmptyState hasContacts={contacts.length > 0} />
            </motion.div>
          )}
        {filteredPhoneBookEntries.map((contact) => {
          return (
            <motion.div
              key={contact.id}
              layout="position"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <ContactCard
                contact={contact}
                setDialogState={setDialogState}
                onToggleFavorite={onToggleFavorite}
              />
            </motion.div>
          )
        })}
        </AnimatePresence>
      </div>
    </section>
  )
}
