"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import ButtonCreate from "@/components/ButtonCreate"
import ButtonReset from "@/components/ButtonReset"
import ContactActionDialog from "@/components/ContactDialog"
import ContactList from "@/components/ContactList"
import SearchBar from "@/components/SearchBar"
import { Contact } from "@/types/Contact"
import { ContactFilters, DEFAULT_CONTACT_FILTERS } from "@/types/ContactFilters"
import { DialogState } from "@/types/DialogState"
import usePhoneBookService from "@/utils/usePhoneBookService"

export default function PhoneBookApp() {
  const { phoneBookState, send } = usePhoneBookService()

  useEffect(() => {
    if (phoneBookState.matches("idle")) send({ type: "READ" })
  }, [phoneBookState, send])

  const { contacts, persistenceFailure } = phoneBookState.context

  useEffect(() => {
    if (!persistenceFailure) return

    toast.error(
      persistenceFailure.operation === "read"
        ? "Saved contacts couldn’t be loaded. Demo contacts restored."
        : "Changes are available now but couldn’t be saved for your next visit.",
    )
    send({ type: "CLEAR_PERSISTENCE_FAILURE" })
  }, [persistenceFailure, send])

  const [contactFilters, setContactFilters] = useState<ContactFilters>(
    DEFAULT_CONTACT_FILTERS,
  )

  const [dialogState, setDialogState] = useState<DialogState>({
    type: "CLOSED",
  })

  if (!phoneBookState.matches("ready")) return null

  const toggleFavorite = (contact: Contact) => {
    send({ type: "TOGGLE_FAVORITE", contactId: contact.id })
    const favoriteAction = contact.isFavorite ? "removed from" : "added to"
    toast.success(
      `${contact.firstName} ${contact.lastName} ${favoriteAction} favorites.`,
    )
  }

  const reorderContact = (contact: Contact, direction: "up" | "down") => {
    send({ type: "MOVE_CONTACT", contactId: contact.id, direction })
  }

  const reorderFilteredContacts = (
    filteredContactIds: number[],
    reorderedFilteredContactIds: number[],
  ) => {
    send({
      type: "REORDER_FILTERED_CONTACTS",
      filteredContactIds,
      reorderedFilteredContactIds,
    })
  }

  return (
    <>
      <ContactActionDialog
        dialogState={dialogState}
        setDialogState={setDialogState}
        contacts={contacts}
      />

      <h1 className="sr-only">Portfolio CRM</h1>

      <div className="mx-auto flex w-full max-w-[76rem] min-w-0 flex-col items-center justify-center space-y-6 py-4">
        <section
          id="filter"
          aria-label="Contact filters and actions"
          className="flex w-full flex-col gap-4"
          tabIndex={-1}
        >
          <SearchBar
            contactFilters={contactFilters}
            onSearchQueryChange={(searchQuery) =>
              setContactFilters((currentContactFilters) => ({
                ...currentContactFilters,
                searchQuery,
              }))
            }
            onSelectedAgeRangeLabelChange={(selectedAgeRangeLabel) =>
              setContactFilters((currentContactFilters) => ({
                ...currentContactFilters,
                selectedAgeRangeLabel,
              }))
            }
            onShowFavoritesOnlyChange={(showFavoritesOnly) =>
              setContactFilters((currentContactFilters) => ({
                ...currentContactFilters,
                showFavoritesOnly,
              }))
            }
            onClearFilters={() => setContactFilters(DEFAULT_CONTACT_FILTERS)}
          />
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <ButtonReset setDialogState={setDialogState} />
            <ButtonCreate setDialogState={setDialogState} />
          </div>
        </section>
        <ContactList
          contacts={contacts}
          contactFilters={contactFilters}
          setDialogState={setDialogState}
          onToggleFavorite={toggleFavorite}
          onMoveContact={reorderContact}
          onReorderFilteredContacts={reorderFilteredContacts}
        />
      </div>
    </>
  )
}
