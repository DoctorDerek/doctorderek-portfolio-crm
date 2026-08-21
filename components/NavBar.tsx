"use client"

import { Dialog } from "@headlessui/react"
import { Bars3Icon, DevicePhoneMobileIcon } from "@heroicons/react/24/solid"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import ContactDialogClose from "@/components/ButtonCloseDialog"
import ReactConfetti from "@/components/ReactConfetti"

const FILTER_SECTION_ID = "filter"

function focusFilterSection() {
  const filterSection = document.getElementById(
    FILTER_SECTION_ID,
  ) as HTMLElement
  filterSection.focus()
}

function ThemeToggleLoadingPlaceholder() {
  return (
    <div aria-hidden="true" className="mx-1 w-28 shrink-0 p-1 sm:w-36">
      <div className="aspect-[17/7] w-full" />
    </div>
  )
}

const ToggleDarkMode = dynamic(() => import("@/components/ToggleDarkMode"), {
  ssr: false,
  loading: ThemeToggleLoadingPlaceholder,
})

function NavBarLinks({
  onHomeNavigate,
  onFilterNavigate,
}: {
  onHomeNavigate?: () => void
  onFilterNavigate?: () => void
}) {
  return (
    <>
      <Link
        href="#main-content"
        onClick={onHomeNavigate}
        className="hover:text-gray-300 dark:hover:text-gray-500"
      >
        Home
      </Link>
      <Link
        href={`#${FILTER_SECTION_ID}`}
        onClick={onFilterNavigate}
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
  navigateToFilter,
}: {
  isDialogOpen: boolean
  closeDialog: () => void
  navigateToFilter: () => void
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
          <NavBarLinks
            onHomeNavigate={closeDialog}
            onFilterNavigate={navigateToFilter}
          />
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}

export default function NavBar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const shouldFocusFilterAfterDialogClose = useRef(false)
  const closeDialog = () => setIsDialogOpen(false)
  const openDialog = () => setIsDialogOpen(true)

  useEffect(() => {
    if (isDialogOpen || !shouldFocusFilterAfterDialogClose.current) return

    shouldFocusFilterAfterDialogClose.current = false
    queueMicrotask(focusFilterSection)
  }, [isDialogOpen])

  const navigateToFilter = () => {
    if (!isDialogOpen) {
      focusFilterSection()
      return
    }

    shouldFocusFilterAfterDialogClose.current = true
    closeDialog()
  }

  return (
    <>
      <nav className="flex w-full flex-wrap items-center justify-center gap-3 bg-black p-4 text-xs tracking-widest text-white uppercase sm:flex-nowrap sm:justify-between sm:gap-0 xl:p-6">
        <div className="order-1 flex min-w-0 items-center justify-center sm:order-none xl:space-x-12">
          <span className="normal-case">
            <span className="text-sm sm:text-base xl:hidden">
              CRM by @DoctorDerek
            </span>
            <span className="hidden text-base xl:inline">by @DoctorDerek</span>
          </span>
          <div className="hidden items-center space-x-12 xl:flex">
            <NavBarLinks onFilterNavigate={navigateToFilter} />
          </div>
        </div>
        <div className="order-3 flex basis-full items-center justify-center gap-2 sm:order-none sm:basis-auto">
          <ToggleDarkMode />
        </div>
        <div className="hidden xl:flex">
          <PortfolioCRMHeading />
        </div>
        <div className="order-2 block sm:order-none xl:hidden">
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
        navigateToFilter={navigateToFilter}
      />
    </>
  )
}
