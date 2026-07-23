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

  it("recalculates legacy stored ages on both sides of a birthday", () => {
    localStorage.setItem(
      CONTACTS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 1,
          firstName: "Ada",
          lastName: "Lovelace",
          birthYear: "2000",
          birthMonth: "07",
          birthDay: "21",
          age: 999,
        },
      ]),
    )
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-20T12:00:00.000Z"))

    const beforeBirthdayActor = createActor(phoneBookMachine).start()
    beforeBirthdayActor.send({ type: "READ" })
    expect(beforeBirthdayActor.getSnapshot().context.contacts[0].age).toBe(25)
    beforeBirthdayActor.stop()

    vi.setSystemTime(new Date("2026-07-21T12:00:00.000Z"))
    const onBirthdayActor = createActor(phoneBookMachine).start()
    onBirthdayActor.send({ type: "READ" })
    expect(onBirthdayActor.getSnapshot().context.contacts[0].age).toBe(26)
    onBirthdayActor.stop()
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

  it("normalizes and persists created contacts without mutating the event payload", () => {
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
    expect(contacts.at(-1)).toEqual(
      expect.objectContaining({ id: 100, age: 26, order: contacts.length - 1 }),
    )

    const storedContacts = JSON.parse(
      localStorage.getItem(CONTACTS_STORAGE_KEY) ?? "[]",
    ) as { id: number; age?: number }[]
    expect(storedContacts.at(-1)).toEqual(expect.objectContaining({ id: 100 }))
    expect(storedContacts.at(-1)).toEqual(
      expect.objectContaining({ order: contacts.length - 1 }),
    )
    expect(storedContacts.at(-1)).not.toHaveProperty("age")
    phoneBookActor.stop()
  })

  it("reorders contacts while preserving other fields and persistence", () => {
    const phoneBookActor = createActor(phoneBookMachine).start()
    phoneBookActor.send({ type: "READ" })
    const originalContactEntries = phoneBookActor.getSnapshot().context.contacts
    const firstContact = originalContactEntries[0]
    const secondContact = originalContactEntries[1]
    expect(firstContact).toBeDefined()
    expect(secondContact).toBeDefined()

    phoneBookActor.send({
      type: "MOVE_CONTACT",
      contactId: firstContact.id,
      direction: "down",
    })

    const contactsAfterMove = phoneBookActor.getSnapshot().context.contacts
    expect(contactsAfterMove[0]).toEqual(expect.objectContaining({ id: secondContact.id }))
    expect(contactsAfterMove[1]).toEqual(
      expect.objectContaining({ id: firstContact.id, order: 1 }),
    )

    const storedContacts = JSON.parse(
      localStorage.getItem(CONTACTS_STORAGE_KEY) ?? "[]",
    ) as { id: number; order?: number; age?: number }[]
    expect(storedContacts[0]).toEqual(expect.objectContaining({ id: secondContact.id }))
    expect(storedContacts[1]).toEqual(
      expect.objectContaining({ id: firstContact.id, order: 1 }),
    )
    expect(storedContacts[1]).not.toHaveProperty("age")
    phoneBookActor.stop()
  })

  it("recalculates updated contacts before persistence", () => {
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
    expect(contacts[0]).toEqual(
      expect.objectContaining({ id: originalContact.id, age: 25 }),
    )

    const persistedContact = contacts.find(({ id }) => id === originalContact.id)
    expect(persistedContact).toEqual(expect.objectContaining({ order: 0 }))

    const storedContacts = JSON.parse(
      localStorage.getItem(CONTACTS_STORAGE_KEY) ?? "[]",
    ) as { id: number; age?: number }[]
    expect(storedContacts.find((contact) => contact.id === originalContact.id)).toEqual(
      expect.objectContaining({ id: originalContact.id }),
    )
    expect(
      storedContacts.find((contact) => contact.id === originalContact.id),
    ).not.toHaveProperty("age")
    phoneBookActor.stop()
  })

  it("restores fresh demonstration contacts on every reset", () => {
    const phoneBookActor = createActor(phoneBookMachine).start()
    phoneBookActor.send({ type: "READ" })
    const initialContacts = phoneBookActor.getSnapshot().context.contacts
    const initialContact = initialContacts[0]

    phoneBookActor.send({
      type: "UPDATE",
      contact: { ...initialContact, firstName: "Changed" },
    })
    phoneBookActor.send({ type: "RESET" })

    const firstResetContacts = phoneBookActor.getSnapshot().context.contacts
    expect(firstResetContacts).not.toBe(initialContacts)
    expect(firstResetContacts[0]).not.toBe(initialContact)
    expect(firstResetContacts[0].firstName).toBe(initialContact.firstName)

    phoneBookActor.send({
      type: "UPDATE",
      contact: { ...firstResetContacts[0], firstName: "Changed again" },
    })
    phoneBookActor.send({ type: "RESET" })

    const secondResetContacts = phoneBookActor.getSnapshot().context.contacts
    expect(secondResetContacts).not.toBe(firstResetContacts)
    expect(secondResetContacts[0]).not.toBe(firstResetContacts[0])
    expect(secondResetContacts[0].firstName).toBe(initialContact.firstName)
    phoneBookActor.stop()
  })
})
