import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Providers from "@/app/providers"
import PhoneBookApp from "@/components/PhoneBookApp"
import { CONTACTS_STORAGE_KEY } from "@/utils/phoneBookMachine"

function renderPhoneBookApp() {
  return render(
    <Providers>
      <PhoneBookApp />
    </Providers>,
  )
}

describe("contact discovery", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("composes free-text search and age-range selection", async () => {
    renderPhoneBookApp()
    expect(
      screen.getByRole("heading", { name: "Portfolio CRM", level: 1 }),
    ).toBeInTheDocument()
    await screen.findByText("Jessica Christian")

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search contacts" }),
      {
        target: { value: "San Francisco" },
      },
    )
    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 5 of 6 contacts",
    )

    fireEvent.change(screen.getByRole("combobox", { name: "Age range" }), {
      target: { value: "Seniors" },
    })

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Showing 2 of 6 contacts",
      )
    })
    expect(screen.getByText("Tadas Petrokas")).toBeInTheDocument()
    expect(screen.getByText("Yohan Marion")).toBeInTheDocument()
  })

  it("persists favorites and filters the visible contact list", async () => {
    renderPhoneBookApp()
    await screen.findByText("Jessica Christian")

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add Jessica Christian to favorites",
      }),
    )
    fireEvent.click(screen.getByRole("button", { name: "Favorites only" }))

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Showing 1 of 6 contacts",
      )
    })
    await waitFor(() => {
      expect(screen.queryByText("Lia Bekyan")).not.toBeInTheDocument()
    })
    expect(
      screen.getByRole("button", {
        name: "Remove Jessica Christian from favorites",
      }),
    ).toHaveAttribute("aria-pressed", "true")

    const storedContacts = JSON.parse(
      localStorage.getItem(CONTACTS_STORAGE_KEY) ?? "[]",
    ) as { firstName: string; isFavorite?: boolean }[]
    expect(
      storedContacts.find(({ firstName }) => firstName === "Jessica")
        ?.isFavorite,
    ).toBe(true)
  })

  it("explains empty results and restores all contacts from Clear", async () => {
    renderPhoneBookApp()
    await screen.findByText("Jessica Christian")

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search contacts" }),
      {
        target: { value: "No such contact" },
      },
    )

    expect(
      await screen.findByRole("heading", { name: "No matching contacts" }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Clear" }))

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Showing 6 of 6 contacts",
      )
    })
  })

  it("restores demo contacts and explains an invalid saved payload", async () => {
    localStorage.setItem(CONTACTS_STORAGE_KEY, "invalid contact data")

    renderPhoneBookApp()

    expect(await screen.findByText("Jessica Christian")).toBeInTheDocument()
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Saved contacts couldn’t be loaded. Demo contacts restored.",
    )
    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 6 of 6 contacts",
    )
  })

  it("keeps an in-memory favorite and explains a failed persistence write", async () => {
    renderPhoneBookApp()
    await screen.findByText("Jessica Christian")
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable")
    })

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add Jessica Christian to favorites",
      }),
    )

    expect(
      await screen.findByRole("button", {
        name: "Remove Jessica Christian from favorites",
      }),
    ).toHaveAttribute("aria-pressed", "true")
    expect(
      await screen.findByText(
        "Changes are available now but couldn’t be saved for your next visit.",
      ),
    ).toBeInTheDocument()
  })
})
