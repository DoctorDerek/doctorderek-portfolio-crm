import { AnimatePresence, motion } from "motion/react"
import { Dispatch, DragEvent, SetStateAction, useState } from "react"
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
  onMoveContactToContact,
}: {
  contacts: Contact[]
  contactFilters: ContactFilters
  setDialogState: Dispatch<SetStateAction<DialogState>>
  onToggleFavorite: (contact: Contact) => void
  onMoveContact: (contact: Contact, direction: "down" | "up") => void
  onMoveContactToContact: (
    contactId: number,
    targetContactId: number,
    insertAfter: boolean,
  ) => void
}) {
  const filteredPhoneBookEntries = filterContacts(contacts, contactFilters)
  const { shouldReduceMotion } = useMotionPreference()
  const contactTransition = { duration: shouldReduceMotion ? 0 : 0.2 }
  const [draggingContactId, setDraggingContactId] = useState<number | null>(
    null,
  )

  const handleMoveContactByDrop = (
    targetContact: Contact,
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault()
    const payload = event.dataTransfer.getData("text/plain")
    const sourceContactId = Number(payload)

    if (!Number.isFinite(sourceContactId) || payload.length === 0) {
      return
    }

    const { id: targetContactId } = targetContact
    if (sourceContactId === targetContactId) return

    const dropTarget = event.currentTarget.getBoundingClientRect()
    const shouldInsertAfter =
      event.clientY > dropTarget.top + dropTarget.height / 2

    onMoveContactToContact(sourceContactId, targetContactId, shouldInsertAfter)
    setDraggingContactId(null)
  }

  const handleMoveContactDragStart = (
    contact: Contact,
    event: DragEvent<HTMLDivElement>,
  ) => {
    setDraggingContactId(contact.id)
    event.dataTransfer.setData("text/plain", String(contact.id))
    event.dataTransfer.effectAllowed = "move"
  }

  const handleMoveContactDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  return (
    <section className="relative w-full space-y-4" aria-label="Contact results">
      <ContactResultsSummary
        filteredContactCount={filteredPhoneBookEntries.length}
        totalContactCount={contacts.length}
      />
      <div className="space-y-6">
        <AnimatePresence initial={false} mode="popLayout">
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
          {filteredPhoneBookEntries.map((contact, contactIndex) => {
            return (
              <motion.div
                key={contact.id}
                draggable
                onDragStart={(event) =>
                  handleMoveContactDragStart(contact, event)
                }
                onDragOver={(event) => handleMoveContactDragOver(event)}
                onDrop={(event) => handleMoveContactByDrop(contact, event)}
                onDragEnd={() => setDraggingContactId(null)}
                onDragCancel={() => setDraggingContactId(null)}
                layout={shouldReduceMotion ? false : "position"}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }
                }
                transition={contactTransition}
                className={
                  draggingContactId === contact.id
                    ? "cursor-grabbing"
                    : "cursor-grab"
                }
              >
                <ContactCard
                  contact={contact}
                  setDialogState={setDialogState}
                  onToggleFavorite={onToggleFavorite}
                  onMoveContact={onMoveContact}
                  isLast={contactIndex === filteredPhoneBookEntries.length - 1}
                  isFirst={contactIndex === 0}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </section>
  )
}
