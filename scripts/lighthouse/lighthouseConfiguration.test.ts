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

  it("configures authenticated Preview runs without hardcoding credentials", () => {
    expect(
      getLighthouseCollectionConfiguration({
        LIGHTHOUSE_TARGET_URL: "https://preview.example.com",
        LIGHTHOUSE_NUMBER_OF_RUNS: "3",
        LIGHTHOUSE_OUTPUT_DIRECTORY: "./preview-results",
        LIGHTHOUSE_VERCEL_TRUSTED_OIDC_TOKEN: "short-lived-token",
      }),
    ).toEqual({
      extraHeaders: {
        "x-vercel-trusted-oidc-idp-token": "short-lived-token",
      },
      numberOfRuns: 3,
      outputDirectory: "./preview-results",
      targetUrl: "https://preview.example.com",
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
