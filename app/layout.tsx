import Providers from "@/app/providers"
import NavBar from "@/components/NavBar"
import "@/styles/globals.css"
import { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Portfolio CRM by @DoctorDerek",
  description:
    "A local-first portfolio CRM with accessible contact workflows, composed filtering, favorites, and animated theming.",
  icons: "/favicon.ico",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-950 antialiased dark:bg-gray-800 dark:text-gray-100">
        <Providers>
          <NavBar />
          <main
            id="main-content"
            className="mx-auto flex min-h-screen w-full min-w-0 flex-col px-4 py-8 sm:px-6 md:px-8"
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
