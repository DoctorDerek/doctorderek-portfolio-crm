import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react"
import { Dispatch, SetStateAction, useState } from "react"
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
  const [reorderedFilteredContactIds, setReorderedFilteredContactIds] =
    useState<number[]>(filteredContactIds)
  const [reorderAnnouncement, setReorderAnnouncement] = useState("")
  const reorderedContactIdSet = new Set(reorderedFilteredContactIds)
  const hasReorderedContactIdSet =
    reorderedFilteredContactIds.length === filteredContactIds.length &&
    reorderedContactIdSet.size === filteredContactIds.length &&
    reorderedFilteredContactIds.every((contactId) =>
      filteredContactIds.includes(contactId),
    )
  const hasReorderedContactOrder =
    hasReorderedContactIdSet &&
    reorderedFilteredContactIds.every(
      (contactId, index) => contactId === filteredContactIds[index],
    )
  const visibleContactIds = hasReorderedContactIdSet
    ? reorderedFilteredContactIds
    : filteredContactIds

  const contactTransition = { duration: shouldReduceMotion ? 0 : 0.2 }

  const handleReorder = (nextContactIds: number[]) => {
    if (shouldReduceMotion) return
    setReorderedFilteredContactIds(nextContactIds)
  }

  const announceReorder = (nextContactIds: number[]) => {
    const movedContactIndex = nextContactIds.findIndex(
      (contactId, index) => contactId !== filteredContactIds[index],
    )
    if (movedContactIndex < 0) {
      setReorderAnnouncement("")
      return
    }

    const movedContactId = nextContactIds[movedContactIndex]
    const movedContact = findContactById(movedContactId)
    if (!movedContact) {
      setReorderAnnouncement("")
      return
    }

    const position = movedContactIndex + 1
    setReorderAnnouncement(
      `${movedContact.firstName} ${movedContact.lastName} moved to position ${position}.`,
    )
  }

  const handleDragEnd = () => {
    if (!onReorderFilteredContacts) return
    if (!hasReorderedContactOrder) {
      announceReorder(reorderedFilteredContactIds)
      onReorderFilteredContacts(filteredContactIds, reorderedFilteredContactIds)
    } else {
      setReorderAnnouncement("")
    }
  }

  const findContactById = (contactId: number) =>
    filteredPhoneBookEntries.find(({ id }) => id === contactId)

  return (
    <section className="relative w-full space-y-4" aria-label="Contact results">
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {reorderAnnouncement}
      </p>
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
          values={visibleContactIds}
          onReorder={handleReorder}
        >
          {visibleContactIds.map((contactId, contactIndex) => {
            const contact = findContactById(contactId)
            if (!contact) return null

            return (
              <SortableContact
                key={contact.id}
                contact={contact}
                shouldReduceMotion={shouldReduceMotion}
                contactTransition={contactTransition}
                onDragEnd={handleDragEnd}
                setDialogState={setDialogState}
                onToggleFavorite={onToggleFavorite}
                onMoveContact={onMoveContact}
                isFirst={contactIndex === 0}
                isLast={contactIndex === visibleContactIds.length - 1}
              />
            )
          })}
        </Reorder.Group>
      </div>
    </section>
  )
}

function SortableContact({
  contact,
  shouldReduceMotion,
  contactTransition,
  onDragEnd,
  setDialogState,
  onToggleFavorite,
  onMoveContact,
  isFirst,
  isLast,
}: {
  contact: Contact
  shouldReduceMotion: boolean
  contactTransition: { duration: number }
  onDragEnd: () => void
  setDialogState: Dispatch<SetStateAction<DialogState>>
  onToggleFavorite: (contact: Contact) => void
  onMoveContact: (contact: Contact, direction: "down" | "up") => void
  isFirst: boolean
  isLast: boolean
}) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={contact.id}
      layout={shouldReduceMotion ? undefined : "position"}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      transition={contactTransition}
      onDragEnd={onDragEnd}
      dragListener={false}
      dragControls={dragControls}
    >
      <ContactCard
        contact={contact}
        setDialogState={setDialogState}
        onToggleFavorite={onToggleFavorite}
        onDragStart={(event) => {
          if (shouldReduceMotion) return
          dragControls.start(event)
        }}
        onMoveContact={onMoveContact}
        isLast={isLast}
        isFirst={isFirst}
      />
    </Reorder.Item>
  )
}
