import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ContactList from "@/components/ContactList"
import { Contact } from "@/types/Contact"

let capturedReorderHandler: ((value: number[]) => void) | null = null
let capturedDragEndHandler: (() => void) | null = null
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
    useDragControls: () => ({ start: vi.fn() }),
  }
})

vi.mock("@/components/MotionPreferenceContext", () => ({
  useMotionPreference: () => ({ shouldReduceMotion }),
}))

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
}: {
  onReorderFilteredContacts?: (
    filteredContactIds: number[],
    reorderedFilteredContactIds: number[],
  ) => void
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
      onMoveContact={vi.fn()}
      onReorderFilteredContacts={onReorderFilteredContacts}
    />,
  )
}

const ASSERTED_FILTERED_IDS = [1, 2, 3]

describe("contact list", () => {
  beforeEach(() => {
    capturedReorderHandler = null
    capturedDragEndHandler = null
    shouldReduceMotion = false
  })

  it("proposes filtered reorder payloads and commits the reorder when motion is enabled", () => {
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

  it("does not emit a filtered reorder when reduced motion is active", () => {
    shouldReduceMotion = true
    const onReorderFilteredContacts = vi.fn()

    renderContactList({ onReorderFilteredContacts })

    const reorderedIds = [3, 2, 1]
    act(() => {
      capturedReorderHandler?.(reorderedIds)
      capturedDragEndHandler?.()
    })

    expect(onReorderFilteredContacts).not.toHaveBeenCalled()
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

    expect(
      screen.getAllByRole("button", { name: /Reorder .* by dragging/ }),
    ).toHaveLength(CONTACTS.length)
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
})
