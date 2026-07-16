"use client"

import { useActorRef } from "@xstate/react"
import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import GlobalStateContext from "@/components/GlobalStateContext"
import phoneBookMachine from "@/utils/phoneBookMachine"

export default function Providers({ children }: { children: ReactNode }) {
  const phoneBookService = useActorRef(phoneBookMachine)

  return (
    <GlobalStateContext.Provider value={{ phoneBookService }}>
      <ThemeProvider attribute="class" defaultTheme="system">
        {children}
      </ThemeProvider>
    </GlobalStateContext.Provider>
  )
}
