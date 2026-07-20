"use client"

import { Dialog } from "@headlessui/react"
import { Bars3Icon, DevicePhoneMobileIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { useState } from "react"
import ContactDialogClose from "@/components/ButtonCloseDialog"
import ButtonMotionPreference from "@/components/ButtonMotionPreference"
import ReactConfetti from "@/components/ReactConfetti"
import ThemeSwitch from "@/components/ThemeSwitch"

function NavBarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link
        href="#top"
        onClick={onNavigate}
        className="hover:text-gray-300 dark:hover:text-gray-500"
        id="top"
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
      <nav className="flex w-full items-center justify-between bg-black p-6 text-xs tracking-widest text-white uppercase">
        <div className="flex items-center space-x-12">
          <span className="text-base">NavBar</span>
          <div className="hidden items-center space-x-12 xl:flex">
            <NavBarLinks />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ButtonMotionPreference />
          <ThemeSwitch />
        </div>
        <div className="hidden xl:flex">
          <PortfolioCRMHeading />
        </div>
        <div className="block xl:hidden">
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
