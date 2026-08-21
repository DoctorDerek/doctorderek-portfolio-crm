import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  extractLighthouseScores,
  prepareLighthouseReports,
  selectMedianPerformanceRun,
} from "@/scripts/lighthouse/prepareLighthouseReports"

const temporaryDirectories: string[] = []

const createLighthouseResult = (
  performance: number,
  accessibility = 1,
  bestPractices = 1,
  seo = 1,
) => ({
  categories: {
    performance: { score: performance },
    accessibility: { score: accessibility },
    "best-practices": { score: bestPractices },
    seo: { score: seo },
  },
})

const createTemporaryDirectory = () => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "portfolio-crm-lighthouse-"),
  )
  temporaryDirectories.push(temporaryDirectory)
  return temporaryDirectory
}

describe("prepareLighthouseReports", () => {
  afterEach(() => {
    for (const temporaryDirectory of temporaryDirectories.splice(0))
      fs.rmSync(temporaryDirectory, { force: true, recursive: true })
  })

  it("selects the stable median performance run and publishes its reports", () => {
    const resultsDirectory = createTemporaryDirectory()
    const publishedDirectory = path.join(resultsDirectory, "published")
    const manifest = [0.91, 0.72, 0.83].map((performance, runIndex) => {
      const jsonPath = path.join(resultsDirectory, `run-${runIndex}.json`)
      const htmlPath = path.join(resultsDirectory, `run-${runIndex}.html`)
      fs.writeFileSync(
        jsonPath,
        JSON.stringify(createLighthouseResult(performance, 0.99, 0.98, 0.97)),
      )
      fs.writeFileSync(htmlPath, `report-${performance}`)
      return { htmlPath, jsonPath }
    })
    fs.writeFileSync(
      path.join(resultsDirectory, "manifest.json"),
      JSON.stringify(manifest),
    )

    const scores = prepareLighthouseReports({
      publishedDirectory,
      resultsDirectory,
    })

    expect(scores).toEqual({
      performance: 83,
      accessibility: 99,
      bestPractices: 98,
      seo: 97,
    })
    expect(
      fs.readFileSync(path.join(publishedDirectory, "index.html"), "utf8"),
    ).toBe("report-0.83")
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(publishedDirectory, "lighthouse-results.json"),
          "utf8",
        ),
      ),
    ).toEqual(scores)
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(resultsDirectory, "lighthouse-summary.json"),
          "utf8",
        ),
      ),
    ).toEqual(scores)
  })

  it("rejects malformed manifests, categories, and empty runs", () => {
    const resultsDirectory = createTemporaryDirectory()
    fs.writeFileSync(path.join(resultsDirectory, "manifest.json"), "{}")
    expect(() => prepareLighthouseReports({ resultsDirectory })).toThrow(
      "manifest must contain an array",
    )

    fs.writeFileSync(
      path.join(resultsDirectory, "manifest.json"),
      JSON.stringify([null]),
    )
    expect(() => prepareLighthouseReports({ resultsDirectory })).toThrow(
      "manifest entry 0 is invalid",
    )

    fs.writeFileSync(
      path.join(resultsDirectory, "manifest.json"),
      JSON.stringify([{}]),
    )
    expect(() => prepareLighthouseReports({ resultsDirectory })).toThrow(
      "missing report paths",
    )

    expect(() => extractLighthouseScores(null)).toThrow("invalid result")
    expect(() => extractLighthouseScores({})).toThrow("missing categories")
    expect(() =>
      extractLighthouseScores({ categories: { performance: {} } }),
    ).toThrow("numeric performance score")
    expect(() => selectMedianPerformanceRun([])).toThrow("completed runs")
  })

  it("uses source order to break equal-performance median ties", () => {
    const selectedRun = selectMedianPerformanceRun([
      {
        lighthouseResult: {},
        manifestEntry: { htmlPath: "second", jsonPath: "second" },
        manifestIndex: 1,
        performanceScore: 0.9,
      },
      {
        lighthouseResult: {},
        manifestEntry: { htmlPath: "first", jsonPath: "first" },
        manifestIndex: 0,
        performanceScore: 0.9,
      },
      {
        lighthouseResult: {},
        manifestEntry: { htmlPath: "third", jsonPath: "third" },
        manifestIndex: 2,
        performanceScore: 0.9,
      },
    ])

    expect(selectedRun.manifestIndex).toBe(1)
  })
})
