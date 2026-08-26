import { describe, expect, it } from "vitest"
import { getLighthouseCollectionConfiguration } from "@/scripts/lighthouse/lighthouseConfiguration"

describe("Lighthouse configuration", () => {
  it("uses the five-run mobile Production defaults", () => {
    expect(getLighthouseCollectionConfiguration({})).toEqual({
      numberOfRuns: 5,
      outputDirectory: "./lighthouse-results",
      targetUrl: "https://portfolio-crm.doctorderek.com/",
    })
  })

  it("accepts explicit local collection overrides", () => {
    expect(
      getLighthouseCollectionConfiguration({
        LIGHTHOUSE_TARGET_URL: "https://target.example.com",
        LIGHTHOUSE_NUMBER_OF_RUNS: "3",
        LIGHTHOUSE_OUTPUT_DIRECTORY: "./target-results",
      }),
    ).toEqual({
      numberOfRuns: 3,
      outputDirectory: "./target-results",
      targetUrl: "https://target.example.com",
    })
  })

  it("rejects invalid run counts", () => {
    expect(() =>
      getLighthouseCollectionConfiguration({
        LIGHTHOUSE_NUMBER_OF_RUNS: "0",
      }),
    ).toThrow("must be a positive integer")
  })
})
