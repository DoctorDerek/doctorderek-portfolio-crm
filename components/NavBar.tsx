"use client"

import { Dialog } from "@headlessui/react"
import { Bars3Icon, DevicePhoneMobileIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { useState } from "react"
import ContactDialogClose from "@/components/ButtonCloseDialog"
import ReactConfetti from "@/components/ReactConfetti"
import ThemeSwitch from "@/components/ThemeSwitch"

/** These are hardcoded to match the design document. */
function NavBarLinks() {
  return (
    <>
      <Link
        href="#top"
        className="hover:text-gray-300 dark:hover:text-gray-500"
        id="top"
      >
        Home
      </Link>
      <Link
        href="#filter"
        className="text-gray-500 hover:text-gray-300 dark:text-gray-300 dark:hover:text-gray-500"
      >
        Filter
      </Link>
    </>
  )
}

function PhoneBookHeading() {
  return (
    <div className="group flex items-center justify-center space-x-2">
      <DevicePhoneMobileIcon className="h-10 w-10 group-hover:animate-spin" />
      <span className="text-2xl font-semibold">Phone Book App</span>
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
      {/* We don't need a wrapper because the mobile menu is full-screen. */}
      <Dialog.Panel className="fixed inset-0 bg-black py-4 text-5xl text-white uppercase">
        <ContactDialogClose closeDialog={closeDialog} size="h-12 w-12" />
        <ReactConfetti />
        <div
          className="flex flex-col items-center space-y-12"
          onClick={() => closeDialog()}
          onKeyDown={(e) => { if (e.key === 'Enter') closeDialog() }}
          role="button"
          tabIndex={0}
        >
          <PhoneBookHeading />
          <NavBarLinks />
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}

/** The `<NavBar>` is a Client Component because it uses the useState hook. */
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
        <ThemeSwitch />
        <div className="hidden xl:flex">
          <PhoneBookHeading />
        </div>
        <div className="block xl:hidden">
          <Bars3Icon
            className="h-7 w-7 hover:animate-pulse"
            onClick={openDialog}
          />
        </div>
      </nav>
      <MobileNavigationMenu
        isDialogOpen={isDialogOpen}
        closeDialog={closeDialog}
      />
    </>
  )
}
