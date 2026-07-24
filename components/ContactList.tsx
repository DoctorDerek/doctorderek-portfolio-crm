import { AnimatePresence, Reorder, motion } from "motion/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import ContactCard from "@/components/ContactCard"
import ContactListEmptyState from "@/components/ContactListEmptyState"
import ContactResultsSummary from "@/components/ContactResultsSummary"
import { useMotionPreference } from "@/components/MotionPreferenceContext"
import { Contact } from "@/types/Contact"
import { ContactFilters } from "@/types/ContactFilters"
import { DialogState } from "@/types/DialogState"
import filterContacts from "@/utils/filterContacts"

export default function ContactList({
  contacts,
  contactFilters,
  setDialogState,
  onToggleFavorite,
  onMoveContact,
  onReorderFilteredContacts,
}: {
  contacts: Contact[]
  contactFilters: ContactFilters
  setDialogState: Dispatch<SetStateAction<DialogState>>
  onToggleFavorite: (contact: Contact) => void
  onMoveContact: (contact: Contact, direction: "down" | "up") => void
  onReorderFilteredContacts?: (
    filteredContactIds: number[],
    reorderedFilteredContactIds: number[],
  ) => void
}) {
  const filteredPhoneBookEntries = filterContacts(contacts, contactFilters)
  const { shouldReduceMotion } = useMotionPreference()
  const filteredContactIds = filteredPhoneBookEntries.map(({ id }) => id)
  const [reorderContactIds, setReorderContactIds] =
    useState<number[]>(filteredContactIds)
  const [activeDragContactId, setActiveDragContactId] = useState<number | null>(
    null,
  )

  useEffect(() => {
    setReorderContactIds(filteredContactIds)
  }, [filteredContactIds])

  const isSameReorderedList = (nextContactIds: number[]) =>
    nextContactIds.length === filteredContactIds.length &&
    nextContactIds.every((contactId, index) => filteredContactIds[index] === contactId)

  const contactTransition = { duration: shouldReduceMotion ? 0 : 0.2 }

  const handleReorder = (nextContactIds: number[]) => {
    setReorderContactIds(nextContactIds)
  }

  const handleDragEnd = () => {
    if (!onReorderFilteredContacts) return
    onReorderFilteredContacts(filteredContactIds, reorderContactIds)
    setActiveDragContactId(null)
  }

  const findContactById = (contactId: number) =>
    filteredPhoneBookEntries.find(({ id }) => id === contactId)

  return (
    <section className="relative w-full space-y-4" aria-label="Contact results">
      <ContactResultsSummary
        filteredContactCount={filteredPhoneBookEntries.length}
        totalContactCount={contacts.length}
      />
      <div className="space-y-6">
        <AnimatePresence initial={false} mode="wait">
          {filteredPhoneBookEntries.length === 0 && (
            <motion.div
              key="contact-list-empty-state"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={contactTransition}
            >
              <ContactListEmptyState hasContacts={contacts.length > 0} />
            </motion.div>
          )}
        </AnimatePresence>
        <Reorder.Group
          axis="y"
          values={reorderContactIds}
          onReorder={handleReorder}
          disabled={shouldReduceMotion}
        >
          {reorderContactIds.map((contactId, contactIndex) => {
            const contact = findContactById(contactId)
            if (!contact) return null

            return (
              <Reorder.Item
                key={contact.id}
                value={contact.id}
                layout={shouldReduceMotion ? false : "position"}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                transition={contactTransition}
                className={
                  activeDragContactId === contact.id
                    ? "cursor-grabbing"
                    : "cursor-grab"
                }
                onDragStart={() => setActiveDragContactId(contact.id)}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveDragContactId(null)}
              >
                <ContactCard
                  contact={contact}
                  setDialogState={setDialogState}
                  onToggleFavorite={onToggleFavorite}
                  onMoveContact={onMoveContact}
                  isLast={contactIndex === reorderContactIds.length - 1}
                  isFirst={contactIndex === 0}
                />
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      </div>
    </section>
  )
}
