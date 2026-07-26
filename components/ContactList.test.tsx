import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ContactList from "@/components/ContactList"
import { Contact } from "@/types/Contact"

let capturedReorderHandler: ((value: number[]) => void) | null = null
let capturedDragEndHandler: (() => void) | null = null
const mockDragStart = vi.fn()
let shouldReduceMotion = false

vi.mock("motion/react", async () => {
  const React = await import("react")
  const actual = await vi.importActual("motion/react")
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    Reorder: {
      Group: ({
        children,
        onReorder,
      }: {
        children: React.ReactNode
        onReorder: (value: number[]) => void
      }) => {
        capturedReorderHandler = onReorder
        return <div>{children}</div>
      },
      Item: ({
        children,
        value,
        onDragEnd,
      }: {
        children: React.ReactNode
        value: number
        onDragEnd?: () => void
      }) => {
        if (value === 1) {
          capturedDragEndHandler = onDragEnd ?? null
        }
        return <div>{children}</div>
      },
    },
    motion: {
      ...(actual.motion as Record<string, unknown>),
      div: ({ children }: { children: React.ReactNode }) =>
        React.createElement("div", undefined, children),
    },
    useDragControls: () => ({ start: mockDragStart }),
    useReducedMotion: () => shouldReduceMotion,
  }
})

const CONTACTS: Contact[] = [
  { id: 1, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" },
  { id: 2, firstName: "Grace", lastName: "Hopper", email: "grace@example.com" },
  {
    id: 3,
    firstName: "Katherine",
    lastName: "Johnson",
    email: "kat@example.com",
  },
]

function renderContactList({
  onReorderFilteredContacts,
  onMoveContact = vi.fn(),
}: {
  onReorderFilteredContacts?: (
    filteredContactIds: number[],
    reorderedFilteredContactIds: number[],
  ) => void
  onMoveContact?: (contact: Contact, direction: "down" | "up") => void
} = {}) {
  return render(
    <ContactList
      contacts={CONTACTS}
      contactFilters={{
        searchQuery: "",
        selectedAgeRangeLabel: "",
        showFavoritesOnly: false,
      }}
      setDialogState={vi.fn()}
      onToggleFavorite={vi.fn()}
      onMoveContact={onMoveContact}
      onReorderFilteredContacts={onReorderFilteredContacts}
    />,
  )
}

const ASSERTED_FILTERED_IDS = [1, 2, 3]

describe("contact list", () => {
  beforeEach(() => {
    capturedReorderHandler = null
    capturedDragEndHandler = null
    mockDragStart.mockClear()
    shouldReduceMotion = false
  })

  it("proposes filtered reorder payloads and commits the reorder", () => {
    const onReorderFilteredContacts = vi.fn()

    renderContactList({ onReorderFilteredContacts })

    const reorderedIds = [...ASSERTED_FILTERED_IDS].reverse()
    act(() => {
      capturedReorderHandler?.(reorderedIds)
    })
    expect(capturedDragEndHandler).toBeInstanceOf(Function)
    act(() => {
      capturedDragEndHandler?.()
    })

    expect(onReorderFilteredContacts).toHaveBeenCalledOnce()
    expect(onReorderFilteredContacts).toHaveBeenCalledWith(
      ASSERTED_FILTERED_IDS,
      reorderedIds,
    )
  })

  it("keeps filtered reorder available when reduced motion is active", () => {
    shouldReduceMotion = true
    const onReorderFilteredContacts = vi.fn()

    renderContactList({ onReorderFilteredContacts })

    const reorderedIds = [3, 2, 1]
    act(() => {
      capturedReorderHandler?.(reorderedIds)
    })
    act(() => {
      capturedDragEndHandler?.()
    })

    expect(onReorderFilteredContacts).toHaveBeenCalledWith(
      ASSERTED_FILTERED_IDS,
      reorderedIds,
    )
  })

  it("does not emit a reorder when visible ids are unchanged", () => {
    const onReorderFilteredContacts = vi.fn()

    renderContactList({ onReorderFilteredContacts })

    act(() => {
      capturedReorderHandler?.(ASSERTED_FILTERED_IDS)
      capturedDragEndHandler?.()
    })

    expect(onReorderFilteredContacts).not.toHaveBeenCalled()
  })

  it("renders drag handles for accessible manual reordering", () => {
    renderContactList()

    const dragHandles = screen.getAllByRole("button", {
      name: /Reorder .* by dragging/,
    })
    expect(dragHandles).toHaveLength(CONTACTS.length)

    fireEvent.pointerDown(dragHandles[0])
    fireEvent.pointerUp(dragHandles[0])

    expect(mockDragStart).toHaveBeenCalledOnce()
  })

  it("exposes directional controls for keyboard reordering", () => {
    const onMoveContact = vi.fn()
    renderContactList({ onMoveContact })

    expect(
      screen.getByRole("button", { name: "Move Ada Lovelace up" }),
    ).toBeDisabled()
    fireEvent.click(
      screen.getByRole("button", { name: "Move Ada Lovelace down" }),
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Move Grace Hopper up" }),
    )

    expect(onMoveContact).toHaveBeenNthCalledWith(1, CONTACTS[0], "down")
    expect(onMoveContact).toHaveBeenNthCalledWith(2, CONTACTS[1], "up")
  })

  it("does not emit a reorder when drag output contains duplicate ids", () => {
    const onReorderFilteredContacts = vi.fn()

    renderContactList({ onReorderFilteredContacts })

    act(() => {
      capturedReorderHandler?.([1, 1, 2])
      capturedDragEndHandler?.()
    })

    expect(onReorderFilteredContacts).not.toHaveBeenCalled()
  })

  it("does not announce an unknown contact id during reorder", () => {
    const onReorderFilteredContacts = vi.fn()

    renderContactList({ onReorderFilteredContacts })

    act(() => {
      capturedReorderHandler?.([999, 2, 3])
    })
    act(() => {
      capturedDragEndHandler?.()
    })

    expect(onReorderFilteredContacts).toHaveBeenCalledWith(
      ASSERTED_FILTERED_IDS,
      [999, 2, 3],
    )
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent("")
  })
})
