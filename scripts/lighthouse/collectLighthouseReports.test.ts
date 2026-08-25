import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { collectLighthouseReports } from "@/scripts/lighthouse/collectLighthouseReports"

const { launchChromeAdapter, runLighthouseAdapter } = vi.hoisted(() => ({
  launchChromeAdapter: vi.fn(),
  runLighthouseAdapter: vi.fn(),
}))

vi.mock("chrome-launcher", () => ({ launch: launchChromeAdapter }))
vi.mock("lighthouse", () => ({ default: runLighthouseAdapter }))

const temporaryDirectories: string[] = []

const createTemporaryDirectory = () => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "doctor-derek-lighthouse-collector-"),
  )
  temporaryDirectories.push(temporaryDirectory)
  return temporaryDirectory
}

describe("collectLighthouseReports", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    launchChromeAdapter.mockReset()
    runLighthouseAdapter.mockReset()

    for (const temporaryDirectory of temporaryDirectories.splice(0))
      fs.rmSync(temporaryDirectory, { force: true, recursive: true })
  })

  it("uses the direct Lighthouse and Chrome adapters", async () => {
    const outputDirectory = createTemporaryDirectory()
    const killChrome = vi.fn(async () => undefined)

    launchChromeAdapter.mockResolvedValue({ kill: killChrome, port: 9222 })
    runLighthouseAdapter.mockResolvedValue({
      lhr: { categories: {} },
      report: "adapter-report",
    })

    const manifest = await collectLighthouseReports({
      numberOfRuns: 1,
      outputDirectory,
      targetUrl: "https://portfolio-crm.doctorderek.com/",
    })

    expect(launchChromeAdapter).toHaveBeenCalledWith({
      chromeFlags: ["--headless=new", "--no-sandbox"],
      userDataDir: expect.stringContaining("doctor-derek-lighthouse-"),
    })
    expect(runLighthouseAdapter).toHaveBeenCalledWith(
      "https://portfolio-crm.doctorderek.com/",
      expect.objectContaining({ port: 9222 }),
    )
    expect(killChrome).toHaveBeenCalledOnce()
    expect(fs.readFileSync(manifest[0]?.htmlPath ?? "", "utf8")).toBe(
      "adapter-report",
    )
  })

  it("rejects an empty direct Lighthouse result", async () => {
    const killChrome = vi.fn(async () => undefined)

    launchChromeAdapter.mockResolvedValue({ kill: killChrome, port: 9222 })
    runLighthouseAdapter.mockResolvedValue(undefined)

    await expect(
      collectLighthouseReports({
        numberOfRuns: 1,
        outputDirectory: createTemporaryDirectory(),
        targetUrl: "https://portfolio-crm.doctorderek.com/",
      }),
    ).rejects.toThrow("run 1 did not return a result")
    expect(killChrome).toHaveBeenCalledOnce()
  })

  it("rejects a malformed direct Lighthouse HTML report", async () => {
    const killChrome = vi.fn(async () => undefined)

    launchChromeAdapter.mockResolvedValue({ kill: killChrome, port: 9222 })
    runLighthouseAdapter.mockResolvedValue({ lhr: {}, report: ["invalid"] })

    await expect(
      collectLighthouseReports({
        numberOfRuns: 1,
        outputDirectory: createTemporaryDirectory(),
        targetUrl: "https://portfolio-crm.doctorderek.com/",
      }),
    ).rejects.toThrow("invalid HTML report")
    expect(killChrome).toHaveBeenCalledOnce()
  })

  it("collects every mobile run and writes the report manifest", async () => {
    const outputDirectory = createTemporaryDirectory()
    const killChrome = vi.fn(async () => undefined)
    const launchChrome = vi.fn(async () => ({
      kill: killChrome,
      port: 9222,
    }))
    const runLighthouse = vi
      .fn()
      .mockResolvedValueOnce({
        lighthouseResult: { run: 1 },
        report: "first-report",
      })
      .mockResolvedValueOnce({
        lighthouseResult: { run: 2 },
        report: "second-report",
      })

    const manifest = await collectLighthouseReports(
      {
        extraHeaders: { "x-vercel-trusted-oidc-idp-token": "token" },
        numberOfRuns: 2,
        outputDirectory,
        targetUrl: "https://preview.example.com",
      },
      { launchChrome, runLighthouse },
    )

    expect(launchChrome).toHaveBeenCalledOnce()
    expect(launchChrome).toHaveBeenCalledWith(
      expect.stringContaining("doctor-derek-lighthouse-"),
    )
    expect(runLighthouse).toHaveBeenCalledTimes(2)
    expect(runLighthouse).toHaveBeenNthCalledWith(
      1,
      "https://preview.example.com",
      {
        extraHeaders: { "x-vercel-trusted-oidc-idp-token": "token" },
        formFactor: "mobile",
        logLevel: "info",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
        output: "html",
        port: 9222,
      },
    )
    expect(killChrome).toHaveBeenCalledOnce()
    expect(manifest).toHaveLength(2)
    expect(
      JSON.parse(
        fs.readFileSync(path.join(outputDirectory, "manifest.json"), "utf8"),
      ),
    ).toEqual(manifest)
    expect(fs.readFileSync(manifest[1]?.htmlPath ?? "", "utf8")).toBe(
      "second-report",
    )
    expect(
      JSON.parse(fs.readFileSync(manifest[1]?.jsonPath ?? "", "utf8")),
    ).toEqual({ run: 2 })
  })

  it("always closes Chrome when a run fails", async () => {
    const killChrome = vi.fn(async () => undefined)

    await expect(
      collectLighthouseReports(
        {
          numberOfRuns: 1,
          outputDirectory: createTemporaryDirectory(),
          targetUrl: "https://portfolio-crm.doctorderek.com/",
        },
        {
          launchChrome: async () => ({ kill: killChrome, port: 9222 }),
          runLighthouse: async () => undefined,
        },
      ),
    ).rejects.toThrow("run 1 did not return a result")
    expect(killChrome).toHaveBeenCalledOnce()
  })

  it("preserves completed reports when Windows delays temporary cleanup", async () => {
    const cleanupError = Object.assign(new Error("Temporary directory busy"), {
      code: "EPERM",
      syscall: "rm",
    })
    const removeTemporaryDirectory = vi
      .spyOn(fs, "rmSync")
      .mockImplementationOnce(() => {
        throw cleanupError
      })
    const killChrome = vi.fn(async () => undefined)

    await expect(
      collectLighthouseReports(
        {
          numberOfRuns: 1,
          outputDirectory: createTemporaryDirectory(),
          targetUrl: "https://portfolio-crm.doctorderek.com/",
        },
        {
          launchChrome: async () => ({ kill: killChrome, port: 9222 }),
          runLighthouse: async () => ({
            lighthouseResult: { categories: {} },
            report: "completed-report",
          }),
        },
      ),
    ).resolves.toHaveLength(1)
    expect(killChrome).toHaveBeenCalledOnce()
    expect(removeTemporaryDirectory).toHaveBeenCalledOnce()
  })

  it("rejects unexpected temporary-directory cleanup failures", async () => {
    const cleanupError = Object.assign(
      new Error("Unexpected cleanup failure"),
      {
        code: "EACCES",
        syscall: "rm",
      },
    )
    const removeTemporaryDirectory = vi
      .spyOn(fs, "rmSync")
      .mockImplementationOnce(() => {
        throw cleanupError
      })
    const killChrome = vi.fn(async () => undefined)

    await expect(
      collectLighthouseReports(
        {
          numberOfRuns: 1,
          outputDirectory: createTemporaryDirectory(),
          targetUrl: "https://portfolio-crm.doctorderek.com/",
        },
        {
          launchChrome: async () => ({ kill: killChrome, port: 9222 }),
          runLighthouse: async () => ({
            lighthouseResult: { categories: {} },
            report: "completed-report",
          }),
        },
      ),
    ).rejects.toThrow("Unexpected cleanup failure")
    expect(killChrome).toHaveBeenCalledOnce()
    expect(removeTemporaryDirectory).toHaveBeenCalledOnce()
  })
})
