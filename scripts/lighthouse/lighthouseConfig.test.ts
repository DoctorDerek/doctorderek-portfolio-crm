import { createRequire } from "node:module"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"

type LighthouseConfiguration = {
  ci: {
    collect: {
      numberOfRuns: number
      settings: {
        extraHeaders?: string
        formFactor: string
        onlyCategories: string[]
      }
      url: string[]
    }
    upload: {
      outputDir: string
      target: string
    }
  }
}

const require = createRequire(import.meta.url)
const configurationPath = path.resolve("lighthouserc.cjs")
const environmentVariableNames = [
  "LIGHTHOUSE_TARGET_URL",
  "LIGHTHOUSE_NUMBER_OF_RUNS",
  "LIGHTHOUSE_OUTPUT_DIRECTORY",
  "LIGHTHOUSE_VERCEL_TRUSTED_OIDC_TOKEN",
] as const
const originalEnvironment = Object.fromEntries(
  environmentVariableNames.map((environmentVariableName) => [
    environmentVariableName,
    process.env[environmentVariableName],
  ]),
)

const loadConfiguration = () => {
  delete require.cache[require.resolve(configurationPath)]
  return require(configurationPath) as LighthouseConfiguration
}

describe("Lighthouse configuration", () => {
  afterEach(() => {
    for (const environmentVariableName of environmentVariableNames) {
      const originalValue = originalEnvironment[environmentVariableName]

      if (originalValue === undefined)
        delete process.env[environmentVariableName]
      else process.env[environmentVariableName] = originalValue
    }
  })

  it("uses the five-run mobile Production defaults", () => {
    for (const environmentVariableName of environmentVariableNames)
      delete process.env[environmentVariableName]

    const configuration = loadConfiguration()

    expect(configuration.ci.collect).toEqual({
      numberOfRuns: 5,
      settings: {
        formFactor: "mobile",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      },
      url: ["https://portfolio-crm.doctorderek.com/"],
    })
    expect(configuration.ci.upload).toEqual({
      outputDir: "./lighthouse-results",
      target: "filesystem",
    })
  })

  it("supports explicit authenticated overrides without hardcoding credentials", () => {
    process.env.LIGHTHOUSE_TARGET_URL = "https://target.example.com"
    process.env.LIGHTHOUSE_NUMBER_OF_RUNS = "3"
    process.env.LIGHTHOUSE_OUTPUT_DIRECTORY = "./target-results"
    process.env.LIGHTHOUSE_VERCEL_TRUSTED_OIDC_TOKEN = "short-lived-token"

    const configuration = loadConfiguration()

    expect(configuration.ci.collect.url).toEqual(["https://target.example.com"])
    expect(configuration.ci.collect.numberOfRuns).toBe(3)
    expect(configuration.ci.collect.settings.extraHeaders).toBe(
      JSON.stringify({
        "x-vercel-trusted-oidc-idp-token": "short-lived-token",
      }),
    )
    expect(configuration.ci.upload.outputDir).toBe("./target-results")
  })

  it("rejects invalid run counts", () => {
    process.env.LIGHTHOUSE_NUMBER_OF_RUNS = "0"

    expect(loadConfiguration).toThrow("must be a positive integer")
  })
})
