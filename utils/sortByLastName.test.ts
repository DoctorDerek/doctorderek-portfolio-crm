import { describe, expect, it } from "vitest"
import { Contact } from "@/types/Contact"
import { sortByLastName } from "@/utils/sortByLastName"

const makeContact = (lastName: string): Contact => ({
  id: 1,
  firstName: "Ada",
  lastName,
})

describe("sortByLastName", () => {
  it("sorts by the final surname segment case-insensitively", () => {
    expect(
      sortByLastName(makeContact("Grace Hopper"), makeContact("Ada Lovelace")),
    ).toBeLessThan(0)
  })

  it("keeps missing surname text sortable without throwing", () => {
    expect(
      sortByLastName(makeContact(""), makeContact("Lovelace")),
    ).toBeLessThan(0)
    expect(
      sortByLastName(makeContact("Lovelace"), makeContact("")),
    ).toBeGreaterThan(0)
  })
})
