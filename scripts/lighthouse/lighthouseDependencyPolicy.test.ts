import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

type PackageManifest = {
  devDependencies?: { [packageName: string]: string }
  scripts?: { [scriptName: string]: string }
}

const packageManifest = JSON.parse(
  fs.readFileSync(path.resolve("package.json"), "utf8"),
) as PackageManifest

describe("Lighthouse dependency policy", () => {
  it("uses the supported direct Lighthouse runner dependencies", () => {
    expect(packageManifest.scripts?.lighthouse).toContain(
      "collectLighthouseReports.cli.ts",
    )
    expect(packageManifest.devDependencies?.lighthouse).toMatch(/^\^\d+$/)
    expect(packageManifest.devDependencies?.["chrome-launcher"]).toMatch(
      /^\^\d+$/,
    )
    expect(packageManifest.devDependencies).not.toHaveProperty("@lhci/cli")
  })
})
