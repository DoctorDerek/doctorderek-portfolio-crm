import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { launch } from "chrome-launcher"
import lighthouse from "lighthouse"
import {
  getLighthouseCollectionConfiguration,
  LIGHTHOUSE_CATEGORIES,
  type LighthouseCollectionConfiguration,
} from "@/scripts/lighthouse/lighthouseConfiguration"

type LighthouseManifestEntry = {
  htmlPath: string
  jsonPath: string
}

type LighthouseRunnerResult = {
  lighthouseResult: unknown
  report: string
}

type LighthouseChrome = {
  kill: () => Promise<void> | void
  port: number
}

type LighthouseCollectorDependencies = {
  launchChrome: (userDataDirectory: string) => Promise<LighthouseChrome>
  runLighthouse: (
    targetUrl: string,
    options: {
      extraHeaders?: Record<string, string>
      formFactor: "mobile"
      logLevel: "info"
      onlyCategories: string[]
      output: "html"
      port: number
    },
  ) => Promise<LighthouseRunnerResult | undefined>
}

const isTemporaryDirectoryCleanupError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "EPERM" &&
  "syscall" in error &&
  error.syscall === "rm"

const removeTemporaryDirectory = (temporaryDirectory: string) => {
  try {
    fs.rmSync(temporaryDirectory, { force: true, recursive: true })
  } catch (error) {
    if (!isTemporaryDirectoryCleanupError(error)) throw error
  }
}

const lighthouseCollectorDependencies: LighthouseCollectorDependencies = {
  launchChrome: async (userDataDirectory) =>
    launch({
      chromeFlags: ["--headless=new", "--no-sandbox"],
      userDataDir: userDataDirectory,
    }),
  runLighthouse: async (targetUrl, options) => {
    const runnerResult = await lighthouse(targetUrl, options)

    if (!runnerResult) return undefined

    if (typeof runnerResult.report !== "string")
      throw new Error("Lighthouse returned an invalid HTML report.")

    return {
      lighthouseResult: runnerResult.lhr,
      report: runnerResult.report,
    }
  },
}

export const collectLighthouseReports = async (
  configuration: LighthouseCollectionConfiguration = getLighthouseCollectionConfiguration(),
  dependencies: LighthouseCollectorDependencies = lighthouseCollectorDependencies,
) => {
  const outputDirectory = path.resolve(configuration.outputDirectory)
  const manifest: LighthouseManifestEntry[] = []
  const userDataDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "doctor-derek-lighthouse-"),
  )

  fs.mkdirSync(outputDirectory, { recursive: true })

  try {
    const chrome = await dependencies.launchChrome(userDataDirectory)

    try {
      for (
        let runNumber = 1;
        runNumber <= configuration.numberOfRuns;
        runNumber += 1
      ) {
        const runnerResult = await dependencies.runLighthouse(
          configuration.targetUrl,
          {
            formFactor: "mobile",
            logLevel: "info",
            onlyCategories: [...LIGHTHOUSE_CATEGORIES],
            output: "html",
            port: chrome.port,
            ...(configuration.extraHeaders
              ? { extraHeaders: configuration.extraHeaders }
              : {}),
          },
        )

        if (!runnerResult)
          throw new Error(
            `Lighthouse run ${runNumber} did not return a result.`,
          )

        const reportFileName = `lighthouse-run-${runNumber}`
        const htmlPath = path.join(
          outputDirectory,
          `${reportFileName}.report.html`,
        )
        const jsonPath = path.join(
          outputDirectory,
          `${reportFileName}.report.json`,
        )

        fs.writeFileSync(htmlPath, runnerResult.report)
        fs.writeFileSync(
          jsonPath,
          `${JSON.stringify(runnerResult.lighthouseResult)}\n`,
        )
        manifest.push({ htmlPath, jsonPath })
      }
    } finally {
      await chrome.kill()
    }
  } finally {
    removeTemporaryDirectory(userDataDirectory)
  }

  fs.writeFileSync(
    path.join(outputDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )

  return manifest
}
