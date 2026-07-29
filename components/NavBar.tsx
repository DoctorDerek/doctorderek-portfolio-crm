"use client"

import { Dialog } from "@headlessui/react"
import { Bars3Icon, DevicePhoneMobileIcon } from "@heroicons/react/24/solid"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useState } from "react"
import ContactDialogClose from "@/components/ButtonCloseDialog"
import ReactConfetti from "@/components/ReactConfetti"

const ToggleDarkMode = dynamic(() => import("@/components/ToggleDarkMode"), {
  ssr: false,
})

function NavBarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link
        href="#main-content"
        onClick={onNavigate}
        className="hover:text-gray-300 dark:hover:text-gray-500"
      >
        Home
      </Link>
      <Link
        href="#filter"
        onClick={onNavigate}
        className="text-gray-500 hover:text-gray-300 dark:text-gray-300 dark:hover:text-gray-500"
      >
        Filter
      </Link>
    </>
  )
}

function PortfolioCRMHeading() {
  return (
    <div className="group flex items-center justify-center space-x-2">
      <DevicePhoneMobileIcon className="h-10 w-10 group-hover:animate-spin" />
      <span className="text-2xl font-semibold">Portfolio CRM</span>
    </div>
  )
}

function MobileNavigationMenu({
  isDialogOpen,
  closeDialog,
}: {
  isDialogOpen: boolean
  closeDialog: () => void
}) {
  return (
    <Dialog open={isDialogOpen} onClose={closeDialog} className="relative z-50">
      <Dialog.Panel
        id="mobile-navigation"
        className="fixed inset-0 bg-black py-4 text-5xl text-white uppercase"
      >
        <Dialog.Title className="sr-only">Navigation</Dialog.Title>
        <ContactDialogClose closeDialog={closeDialog} size="h-12 w-12" />
        <ReactConfetti />
        <div className="flex flex-col items-center space-y-12">
          <PortfolioCRMHeading />
          <NavBarLinks onNavigate={closeDialog} />
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}

export default function NavBar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const closeDialog = () => setIsDialogOpen(false)
  const openDialog = () => setIsDialogOpen(true)

  return (
    <>
      <nav className="flex w-full flex-wrap items-center justify-center gap-3 bg-black p-4 text-xs tracking-widest text-white uppercase lg:flex-nowrap lg:justify-between lg:gap-0 lg:p-6">
        <div className="order-1 flex min-w-0 items-center justify-center space-x-12 lg:order-none">
          <span className="text-base">@DoctorDerek</span>
          <div className="hidden items-center space-x-12 lg:flex">
            <NavBarLinks />
          </div>
        </div>
        <div className="order-3 flex basis-full items-center justify-center gap-2 lg:order-none lg:basis-auto">
          <ToggleDarkMode />
        </div>
        <div className="hidden lg:flex">
          <PortfolioCRMHeading />
        </div>
        <div className="order-2 block lg:order-none lg:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={isDialogOpen}
            aria-controls="mobile-navigation"
            className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-gray-800 hover:text-yellow-300"
            onClick={openDialog}
          >
            <Bars3Icon className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <MobileNavigationMenu
        isDialogOpen={isDialogOpen}
        closeDialog={closeDialog}
      />
    </>
  )
}
