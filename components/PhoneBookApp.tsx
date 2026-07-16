"use client"

import { useEffect, useState } from "react"
import ButtonCreate from "@/components/ButtonCreate"
import ButtonReset from "@/components/ButtonReset"
import ContactActionDialog from "@/components/ContactDialog"
import ContactList from "@/components/ContactList"
import SearchBar from "@/components/SearchBar"
import { DialogState } from "@/types"
import usePhoneBookService from "@/utils/usePhoneBookService"

export default function PhoneBookApp() {
  const { phoneBookState, send } = usePhoneBookService()

  useEffect(() => {
    if (phoneBookState.matches("idle")) send({ type: "READ" })

    if (phoneBookState.matches("running")) send({ type: "FINISH" })
  }, [phoneBookState, send])

  const { context } = phoneBookState || {}
  const { contacts } = context || {}

  const [filterText, setFilterText] = useState("")

  const [dialogState, setDialogState] = useState<DialogState>({
    type: "CLOSED",
  })

  if (!phoneBookState.matches("ready")) return null

  return (
    <>
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
