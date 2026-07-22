import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createActor } from "xstate"
import phoneBookMachine, {
  CONTACTS_STORAGE_KEY,
} from "@/utils/phoneBookMachine"

describe("phoneBookMachine persistence", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("validates and sorts stored contacts when the machine starts", () => {
    localStorage.setItem(
      CONTACTS_STORAGE_KEY,
      JSON.stringify([
        { id: 2, firstName: "Grace", lastName: "Hopper" },
        { id: 1, firstName: "Ada", lastName: "Lovelace" },
      ]),
    )
    const phoneBookActor = createActor(phoneBookMachine).start()

    phoneBookActor.send({ type: "READ" })

    expect(
      phoneBookActor
        .getSnapshot()
        .context.contacts.map(({ lastName }) => lastName),
    ).toEqual(["Hopper", "Lovelace"])
    expect(phoneBookActor.getSnapshot().context.persistenceFailure).toBeNull()
    phoneBookActor.stop()
  })

  it("restores demonstration contacts when stored data is invalid", () => {
    localStorage.setItem(CONTACTS_STORAGE_KEY, "not valid contact JSON")
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
      localStorage.getItem(CONTACTS_STORAGE_KEY) ?? "[]",
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
    const setItemMock = vi
      .spyOn(localStorage, "setItem")
      .mockImplementation(() => {
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
    localStorage.setItem(CONTACTS_STORAGE_KEY, "invalid")
    const phoneBookActor = createActor(phoneBookMachine).start()
    phoneBookActor.send({ type: "READ" })

    phoneBookActor.send({ type: "CLEAR_PERSISTENCE_FAILURE" })

    expect(phoneBookActor.getSnapshot().context.persistenceFailure).toBeNull()
    phoneBookActor.stop()
  })

  it("normalizes and sorts created contacts without mutating the event payload", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-20T12:00:00.000Z"))
    const phoneBookActor = createActor(phoneBookMachine).start()
    phoneBookActor.send({ type: "READ" })
    const contact = {
      id: 100,
      firstName: "Zelda",
      lastName: "Aardvark",
      birthYear: "2000",
      birthMonth: "01",
      birthDay: "01",
    }

    phoneBookActor.send({ type: "CREATE", contact })

    const contacts = phoneBookActor.getSnapshot().context.contacts
    expect(contact).not.toHaveProperty("age")
    expect(contacts[0]).toEqual(expect.objectContaining({ id: 100, age: 26 }))
    expect(contacts.map(({ lastName }) => lastName)).toEqual(
      [...contacts.map(({ lastName }) => lastName)].sort(),
    )

    const storedContacts = JSON.parse(
      localStorage.getItem(CONTACTS_STORAGE_KEY) ?? "[]",
    ) as { id: number; age?: number }[]
    expect(storedContacts[0]).toEqual(
      expect.objectContaining({ id: 100, age: 26 }),
    )
    phoneBookActor.stop()
  })

  it("recalculates and reorders updated contacts before persistence", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-20T12:00:00.000Z"))
    const phoneBookActor = createActor(phoneBookMachine).start()
    phoneBookActor.send({ type: "READ" })
    const originalContact = phoneBookActor.getSnapshot().context.contacts[0]

    phoneBookActor.send({
      type: "UPDATE",
      contact: {
        ...originalContact,
        lastName: "Zulu",
        birthYear: "2000",
        birthMonth: "07",
        birthDay: "21",
        age: 999,
      },
    })

    const contacts = phoneBookActor.getSnapshot().context.contacts
    expect(contacts.at(-1)).toEqual(
      expect.objectContaining({ id: originalContact.id, age: 25 }),
    )

    const storedContacts = JSON.parse(
      localStorage.getItem(CONTACTS_STORAGE_KEY) ?? "[]",
    ) as { id: number; age?: number }[]
    expect(storedContacts.at(-1)).toEqual(
      expect.objectContaining({ id: originalContact.id, age: 25 }),
    )
    phoneBookActor.stop()
  })
})
