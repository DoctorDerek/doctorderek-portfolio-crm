import { createActor } from "xstate"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import phoneBookMachine, {
  LOCALSTORAGE_KEY_AUTH,
} from "@/utils/phoneBookMachine"

describe("phoneBookMachine persistence", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("validates and sorts stored contacts when the machine starts", () => {
    localStorage.setItem(
      LOCALSTORAGE_KEY_AUTH,
      JSON.stringify([
        { id: 2, firstName: "Grace", lastName: "Hopper" },
        { id: 1, firstName: "Ada", lastName: "Lovelace" },
      ]),
    )
    const phoneBookActor = createActor(phoneBookMachine).start()

    phoneBookActor.send({ type: "READ" })

    expect(
      phoneBookActor.getSnapshot().context.contacts.map(({ lastName }) =>
        lastName,
      ),
    ).toEqual(["Hopper", "Lovelace"])
    expect(phoneBookActor.getSnapshot().context.persistenceFailure).toBeNull()
    phoneBookActor.stop()
  })

  it("restores demonstration contacts when stored data is invalid", () => {
    localStorage.setItem(LOCALSTORAGE_KEY_AUTH, "not valid contact JSON")
    const phoneBookActor = createActor(phoneBookMachine).start()

    phoneBookActor.send({ type: "READ" })

    expect(phoneBookActor.getSnapshot().context.contacts).toHaveLength(6)
    expect(phoneBookActor.getSnapshot().context.persistenceFailure).toEqual(
      expect.objectContaining({ operation: "read" }),
    )
    phoneBookActor.stop()
  })

  it("persists favorite mutations without an intermediary state", () => {
    const phoneBookActor = createActor(phoneBookMachine).start()
    phoneBookActor.send({ type: "READ" })
    const contactId = phoneBookActor.getSnapshot().context.contacts[0].id

    phoneBookActor.send({ type: "TOGGLE_FAVORITE", contactId })

    const storedContacts = JSON.parse(
      localStorage.getItem(LOCALSTORAGE_KEY_AUTH) ?? "[]",
    ) as { id: number; isFavorite?: boolean }[]
    expect(
      storedContacts.find((contact) => contact.id === contactId)?.isFavorite,
    ).toBe(true)
    expect(phoneBookActor.getSnapshot().matches("ready")).toBe(true)
    phoneBookActor.stop()
  })

  it("keeps in-memory changes and records typed write failures", () => {
    const phoneBookActor = createActor(phoneBookMachine).start()
    phoneBookActor.send({ type: "READ" })
    const contactId = phoneBookActor.getSnapshot().context.contacts[0].id
    const setItemMock = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable")
    })

    phoneBookActor.send({ type: "TOGGLE_FAVORITE", contactId })

    expect(
      phoneBookActor
        .getSnapshot()
        .context.contacts.find((contact) => contact.id === contactId)
        ?.isFavorite,
    ).toBe(true)
    expect(phoneBookActor.getSnapshot().context.persistenceFailure).toEqual({
      operation: "write",
      message: "Storage unavailable",
    })
    setItemMock.mockRestore()
    phoneBookActor.stop()
  })

  it("clears persistence failures after the interface announces them", () => {
    localStorage.setItem(LOCALSTORAGE_KEY_AUTH, "invalid")
    const phoneBookActor = createActor(phoneBookMachine).start()
    phoneBookActor.send({ type: "READ" })

    phoneBookActor.send({ type: "CLEAR_PERSISTENCE_FAILURE" })

    expect(phoneBookActor.getSnapshot().context.persistenceFailure).toBeNull()
    phoneBookActor.stop()
  })
})
