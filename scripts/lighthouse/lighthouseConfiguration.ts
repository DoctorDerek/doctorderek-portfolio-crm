export type LighthouseCollectionConfiguration = {
  numberOfRuns: number
  outputDirectory: string
  targetUrl: string
}

type LighthouseEnvironment = {
  LIGHTHOUSE_NUMBER_OF_RUNS?: string
  LIGHTHOUSE_OUTPUT_DIRECTORY?: string
  LIGHTHOUSE_TARGET_URL?: string
}

export const LIGHTHOUSE_CATEGORIES = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
]

const PRODUCTION_URL = "https://portfolio-crm.doctorderek.com/"
const PRODUCTION_RUN_COUNT = 5
const DEFAULT_OUTPUT_DIRECTORY = "./lighthouse-results"

export const getLighthouseCollectionConfiguration = (
  environment: LighthouseEnvironment = {
    LIGHTHOUSE_NUMBER_OF_RUNS: process.env.LIGHTHOUSE_NUMBER_OF_RUNS,
    LIGHTHOUSE_OUTPUT_DIRECTORY: process.env.LIGHTHOUSE_OUTPUT_DIRECTORY,
    LIGHTHOUSE_TARGET_URL: process.env.LIGHTHOUSE_TARGET_URL,
  },
): LighthouseCollectionConfiguration => {
  const numberOfRuns = Number.parseInt(
    environment.LIGHTHOUSE_NUMBER_OF_RUNS ?? `${PRODUCTION_RUN_COUNT}`,
    10,
  )

  if (!Number.isInteger(numberOfRuns) || numberOfRuns < 1)
    throw new Error("LIGHTHOUSE_NUMBER_OF_RUNS must be a positive integer.")

  return {
    numberOfRuns,
    outputDirectory:
      environment.LIGHTHOUSE_OUTPUT_DIRECTORY ?? DEFAULT_OUTPUT_DIRECTORY,
    targetUrl: environment.LIGHTHOUSE_TARGET_URL ?? PRODUCTION_URL,
  }
}
