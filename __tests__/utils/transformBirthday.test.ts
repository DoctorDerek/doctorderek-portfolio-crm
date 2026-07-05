import transformBirthday from "@/utils/transformBirthday"

describe("@/utils/transformBirthday", () => {
  it("should return the correct birthday string", () => {
    expect(
      transformBirthday({
        birthYear: "1920",
        birthMonth: "03",
        birthDay: "15",
      }),
    ).toBe("March 15, 1920")
  })
})
