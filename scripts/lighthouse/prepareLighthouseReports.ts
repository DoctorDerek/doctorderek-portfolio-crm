import fs from "node:fs"
import path from "node:path"

type LighthouseScores = {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

type LighthouseManifestEntry = {
  htmlPath: string
  jsonPath: string
}

type LighthouseRun = {
  lighthouseResult: unknown
  manifestEntry: LighthouseManifestEntry
  manifestIndex: number
  performanceScore: number
}

type PrepareLighthouseReportsOptions = {
  publishedDirectory?: string
  resultsDirectory: string
}

const LIGHTHOUSE_CATEGORIES = [
  {
    categoryId: "performance",
    scoreName: "performance",
  },
  {
    categoryId: "accessibility",
    scoreName: "accessibility",
  },
  {
    categoryId: "best-practices",
    scoreName: "bestPractices",
  },
  { categoryId: "seo", scoreName: "seo" },
] as const

const isUnknownRecord = (
  value: unknown,
): value is { [propertyName: string]: unknown } =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readJsonFile = (filePath: string): unknown =>
  JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown

const parseManifestEntry = (
  value: unknown,
  manifestIndex: number,
): LighthouseManifestEntry => {
  if (!isUnknownRecord(value))
    throw new Error(`Lighthouse manifest entry ${manifestIndex} is invalid.`)

  const { htmlPath, jsonPath } = value

  if (typeof htmlPath !== "string" || typeof jsonPath !== "string")
    throw new Error(
      `Lighthouse manifest entry ${manifestIndex} is missing report paths.`,
    )

  return { htmlPath, jsonPath }
}

const readLighthouseManifest = (
  resultsDirectory: string,
): LighthouseManifestEntry[] => {
  const manifest = readJsonFile(path.join(resultsDirectory, "manifest.json"))

  if (!Array.isArray(manifest))
    throw new Error("Lighthouse manifest must contain an array of runs.")

  return manifest.map(parseManifestEntry)
}

const getNumericCategoryScore = (
  lighthouseResult: unknown,
  categoryId: string,
) => {
  if (!isUnknownRecord(lighthouseResult))
    throw new Error("Lighthouse returned an invalid result.")

  const { categories } = lighthouseResult

  if (!isUnknownRecord(categories))
    throw new Error("Lighthouse result is missing categories.")

  const category = categories[categoryId]

  if (!isUnknownRecord(category) || typeof category.score !== "number")
    throw new Error(`Lighthouse did not return a numeric ${categoryId} score.`)

  return category.score
}

export const selectMedianPerformanceRun = (lighthouseRuns: LighthouseRun[]) => {
  const sortedRuns = [...lighthouseRuns].sort(
    (leftRun, rightRun) =>
      leftRun.performanceScore - rightRun.performanceScore ||
      leftRun.manifestIndex - rightRun.manifestIndex,
  )
  const medianRun = sortedRuns[Math.floor(sortedRuns.length / 2)]

  if (!medianRun)
    throw new Error("Lighthouse did not return any completed runs.")

  return medianRun
}

export const extractLighthouseScores = (
  lighthouseResult: unknown,
): LighthouseScores =>
  Object.fromEntries(
    LIGHTHOUSE_CATEGORIES.map(({ categoryId, scoreName }) => [
      scoreName,
      Math.round(getNumericCategoryScore(lighthouseResult, categoryId) * 100),
    ]),
  ) as LighthouseScores

export const prepareLighthouseReports = ({
  publishedDirectory,
  resultsDirectory,
}: PrepareLighthouseReportsOptions) => {
  const lighthouseRuns = readLighthouseManifest(resultsDirectory).map(
    (manifestEntry, manifestIndex): LighthouseRun => {
      const lighthouseResult = readJsonFile(manifestEntry.jsonPath)

      return {
        lighthouseResult,
        manifestEntry,
        manifestIndex,
        performanceScore: getNumericCategoryScore(
          lighthouseResult,
          "performance",
        ),
      }
    },
  )
  const medianRun = selectMedianPerformanceRun(lighthouseRuns)
  const scores = extractLighthouseScores(medianRun.lighthouseResult)
  const serializedScores = `${JSON.stringify(scores, null, 2)}\n`

  fs.writeFileSync(
    path.join(resultsDirectory, "lighthouse-summary.json"),
    serializedScores,
  )

  if (publishedDirectory) {
    fs.mkdirSync(publishedDirectory, { recursive: true })
    fs.copyFileSync(
      medianRun.manifestEntry.htmlPath,
      path.join(publishedDirectory, "index.html"),
    )
    fs.writeFileSync(
      path.join(publishedDirectory, "lighthouse-results.json"),
      serializedScores,
    )
  }

  return scores
}
