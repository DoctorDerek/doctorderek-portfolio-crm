import { afterEach, describe, expect, it, vi } from "vitest"
import { calculateAge } from "@/utils/calculateAge"
import parseContactBirthday from "@/utils/contactBirthday"
import transformBirthday from "@/utils/transformBirthday"

describe("contact birthday parsing", () => {
  const originalTimeZone = process.env.TZ

  afterEach(() => {
    vi.useRealTimers()
    if (originalTimeZone === undefined) delete process.env.TZ
    else process.env.TZ = originalTimeZone
  })

  it("parses real calendar dates without timezone drift", () => {
    expect(
      parseContactBirthday({
        birthYear: "2000",
        birthMonth: "02",
        birthDay: "29",
      })?.toISOString(),
    ).toBe("2000-02-29T12:00:00.000Z")
  })

  it.each([
    { birthYear: "2023", birthMonth: "02", birthDay: "29" },
    { birthYear: "2000", birthMonth: "13", birthDay: "01" },
    { birthYear: "2000", birthMonth: "04", birthDay: "31" },
    { birthYear: "2000", birthMonth: "123", birthDay: "01" },
    { birthYear: "20", birthMonth: "01", birthDay: "01" },
    { birthYear: "year", birthMonth: "month", birthDay: "day" },
  ])(
    "rejects the impossible birthday $birthYear-$birthMonth-$birthDay",
    (birthday) => {
      expect(parseContactBirthday(birthday)).toBeUndefined()
    },
  )

  it("keeps incomplete optional birthdays empty", () => {
    const incompleteBirthday = {
      birthYear: "",
      birthMonth: "",
      birthDay: "",
    }

    expect(parseContactBirthday(incompleteBirthday)).toBeUndefined()
    expect(calculateAge(incompleteBirthday)).toBeUndefined()
    expect(transformBirthday(incompleteBirthday)).toBe("")
  })

  it("derives stable age and presentation from the parsed birthday", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-20T12:00:00.000Z"))
    const birthday = {
      birthYear: "2000",
      birthMonth: "07",
      birthDay: "21",
    }

    expect(calculateAge(birthday)).toBe(25)
    expect(transformBirthday(birthday)).toBe("July 21, 2000")
  })

  it("preserves the calendar date in far-ahead time zones", () => {
    process.env.TZ = "Pacific/Kiritimati"

    expect(
      transformBirthday({
        birthYear: "2000",
        birthMonth: "07",
        birthDay: "21",
      }),
    ).toBe("July 21, 2000")
  })

  it("returns explicit non-throwing fallbacks for impossible birthdays", () => {
    const impossibleBirthday = {
      birthYear: "2023",
      birthMonth: "02",
      birthDay: "29",
    }

    expect(calculateAge(impossibleBirthday)).toBeUndefined()
    expect(transformBirthday(impossibleBirthday)).toBe(
      "Invalid date: 2023-02-29",
    )
  })
})
