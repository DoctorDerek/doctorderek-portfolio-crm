import Providers from "@/app/providers"
import NavBar from "@/components/NavBar"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-950 antialiased dark:bg-gray-800 dark:text-gray-100">
        <Providers>
          <NavBar />
          <main className="mx-auto flex min-h-screen w-[95vw] cursor-crosshair flex-col p-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
