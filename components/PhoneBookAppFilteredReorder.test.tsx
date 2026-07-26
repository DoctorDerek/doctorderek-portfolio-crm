import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Providers from "@/app/providers"
import PhoneBookApp from "@/components/PhoneBookApp"
import { CONTACTS_STORAGE_KEY } from "@/utils/phoneBookMachine"

vi.mock("@/components/ContactList", () => ({
  default: ({
    onReorderFilteredContacts,
  }: {
    onReorderFilteredContacts?: (
      filteredContactIds: number[],
      reorderedFilteredContactIds: number[],
    ) => void
  }) => (
    <button
      type="button"
      onClick={() => onReorderFilteredContacts?.([2, 1], [1, 2])}
    >
      Commit filtered reorder
    </button>
  ),
}))

describe("PhoneBookApp filtered reorder adapter", () => {
  it("persists the filtered reorder payload from ContactList", async () => {
    localStorage.clear()
    render(
      <Providers>
        <PhoneBookApp />
      </Providers>,
    )

    fireEvent.click(
      await screen.findByRole("button", { name: "Commit filtered reorder" }),
    )

    await waitFor(() => {
      const storedContacts = JSON.parse(
        localStorage.getItem(CONTACTS_STORAGE_KEY) ?? "[]",
      ) as { id: number; order?: number }[]
      expect(storedContacts.slice(0, 2).map(({ id }) => id)).toEqual([1, 2])
      expect(storedContacts.slice(0, 2).map(({ order }) => order)).toEqual([
        0, 1,
      ])
    })
  })
})
