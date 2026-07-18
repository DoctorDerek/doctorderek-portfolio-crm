"use client"

import { useActorRef } from "@xstate/react"
import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import { ToastContainer } from "react-toastify"
import GlobalStateContext from "@/components/GlobalStateContext"
import MotionPreferenceProvider from "@/components/MotionPreferenceContext"
import phoneBookMachine from "@/utils/phoneBookMachine"

export default function Providers({ children }: { children: ReactNode }) {
  const phoneBookService = useActorRef(phoneBookMachine)

  return (
    <GlobalStateContext.Provider value={{ phoneBookService }}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <MotionPreferenceProvider>
          {children}
          <ToastContainer
            aria-label="Contact notifications"
            limit={3}
            position="bottom-right"
            theme="colored"
          />
        </MotionPreferenceProvider>
      </ThemeProvider>
    </GlobalStateContext.Provider>
  )
}
