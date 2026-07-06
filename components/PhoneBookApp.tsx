"use client"

import ButtonCreate from "@/components/ButtonCreate"
import ButtonReset from "@/components/ButtonReset"
import ContactActionDialog from "@/components/ContactDialog"
import ContactList from "@/components/ContactList"
import SearchBar from "@/components/SearchBar"
import { DialogState } from "@/types"
import usePhoneBookService from "@/utils/usePhoneBookService"
import { useEffect, useState } from "react"

/**
 * The `<PhoneBookApp>` handles our global state using 3 state handlers:
 * 1. `dialogState` is used to control the dialog box that appears when the user
 *    clicks on a contact card.
 * 2. `filterText` is used to filter the contacts list by age using the
 *    `<SearchBar>` component.
 * 3. `phoneBookState` is used to control the state of the phone book. It's
 *    managed by the `phoneBookMachine` state machine.
 *
 * This component also handles the layout of the main content area of the app.
 * */
export default function PhoneBookApp() {
  const { phoneBookState, send } = usePhoneBookService()

  /** READ the XState machine if it's `idle` or FINISH if it's `running`. */
  useEffect(() => {
    if (phoneBookState.matches("idle")) send({ type: "READ" })

    if (phoneBookState.matches("running")) send({ type: "FINISH" })
  }, [phoneBookState, send])

  /** Unpack our current XState machine context (i.e. the phone book entries) */
  const { context } = phoneBookState || {}
  const { contacts } = context || {}

  /** Set up a state handler for the "search by age range" filter logic. */
  const [filterText, setFilterText] = useState("")

  /** We model the dialogState off the XState action patterns. */
  const [dialogState, setDialogState] = useState<DialogState>({
    type: "CLOSED",
  })

  if (!phoneBookState.matches("ready")) return null

  return (
    <>
      {/**
       * The Dialog doesn't belong in the main content area because we use
       * space-y-2, which wouldn't work correctly with the hidden element.
       * */}
      <ContactActionDialog
        dialogState={dialogState}
        setDialogState={setDialogState}
        contacts={contacts}
      />

      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="grid w-full grid-cols-1 space-y-6 xl:grid-cols-2 xl:space-y-0">
          <SearchBar filterText={filterText} setFilterText={setFilterText} />
          <div className="flex w-full items-center justify-between space-x-1 xl:justify-end">
            <ButtonReset setDialogState={setDialogState} />
            <ButtonCreate setDialogState={setDialogState} />
          </div>
        </div>
        <ContactList
          contacts={contacts}
          filterText={filterText}
          setDialogState={setDialogState}
        />
      </div>
    </>
  )
}
