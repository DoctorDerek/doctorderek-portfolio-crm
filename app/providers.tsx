"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useActorRef } from "@xstate/react"
import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import { ToastContainer } from "react-toastify"
import GlobalStateContext from "@/components/GlobalStateContext"
import phoneBookMachine from "@/utils/phoneBookMachine"
import "react-toastify/dist/ReactToastify.css"

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  const phoneBookService = useActorRef(phoneBookMachine)

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStateContext.Provider value={{ phoneBookService }}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <ToastContainer position="top-center" />
          {children}
        </ThemeProvider>
      </GlobalStateContext.Provider>
    </QueryClientProvider>
  )
}
