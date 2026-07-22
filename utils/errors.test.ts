import { describe, expect, it } from "vitest"
import { getErrorMessage } from "@/utils/errors"

describe("error message normalization", () => {
  it("preserves messages from Error-compatible values", () => {
    expect(getErrorMessage(new Error("Storage unavailable"))).toBe(
      "Storage unavailable",
    )
    expect(getErrorMessage({ message: "Validation failed" })).toBe(
      "Validation failed",
    )
  })

  it("serializes structured thrown values into useful messages", () => {
    expect(getErrorMessage({ operation: "read", status: 503 })).toBe(
      '{"operation":"read","status":503}',
    )
  })

  it("falls back safely when a thrown value cannot be serialized", () => {
    const cyclicValue: { self?: unknown } = {}
    cyclicValue.self = cyclicValue

    expect(getErrorMessage(cyclicValue)).toBe("[object Object]")
  })
})
