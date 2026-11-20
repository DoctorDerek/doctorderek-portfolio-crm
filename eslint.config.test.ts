import { ESLint } from "eslint"
import { beforeAll, describe, expect, it } from "vitest"
import packageManifest from "@/package.json"

const eslint = new ESLint({ cwd: process.cwd() })

beforeAll(async () => {
  await eslint.calculateConfigForFile("app/page.tsx")
})

describe("TypeScript lint configuration", () => {
  it.each([
    "app/page.tsx",
    "components/ContactDialog.tsx",
    "utils/phoneBookMachine.ts",
    "contacts/CONTACTS.tsx",
    "types/Contact.ts",
    "app/page.test.tsx",
    "components/ContactDialog.test.tsx",
    "utils/phoneBookMachine.test.ts",
    "e2e/contact-lifecycle.spec.ts",
    "eslint.config.ts",
    "eslint.config.test.ts",
    "next.config.ts",
    "playwright.config.ts",
    "prettier.config.ts",
    "vitest.config.ts",
    "vitest.setup.ts",
    "utils/lintProbe.mts",
    "utils/lintProbe.cts",
  ])(
    "reports unsafe types in %s without changing advisory severity",
    async (filePath) => {
      const [result] = await eslint.lintText("export type UnsafeValue = any", {
        filePath,
      })

      expect(result.messages).toEqual([
        expect.objectContaining({
          ruleId: "@typescript-eslint/no-explicit-any",
          severity: 1,
        }),
      ])
    },
  )

  it.each([
    "components/ContactDialog.tsx",
    "components/ContactDialog.test.tsx",
    "e2e/contact-lifecycle.spec.ts",
    "vitest.config.ts",
  ])(
    "reports unused imports in %s without test or tooling exemptions",
    async (filePath) => {
      const [result] = await eslint.lintText(
        'import { useRef } from "react"\nexport const value = 1',
        { filePath },
      )

      expect(result.messages).toEqual([
        expect.objectContaining({
          ruleId: "@typescript-eslint/no-unused-vars",
          severity: 1,
        }),
      ])
    },
  )

  it("retains React Hooks rules alongside TypeScript rules", async () => {
    const [result] = await eslint.lintText(
      'import { useState } from "react"; export default function Example({ active }: { active: boolean }) { if (active) useState(0); return null }',
      { filePath: "components/ContactDialog.tsx" },
    )

    expect(result.messages).toEqual([
      expect.objectContaining({ ruleId: "react-hooks/rules-of-hooks" }),
    ])
  })

  it("accepts valid typed JSX", async () => {
    const [result] = await eslint.lintText(
      "export default function Example({ label }: { label: string }) { return <span>{label}</span> }",
      { filePath: "components/ContactDialog.tsx" },
    )

    expect(result.messages).toEqual([])
  })

  it("keeps fatal parsing failures as errors", async () => {
    const [result] = await eslint.lintText("export const value =", {
      filePath: "utils/phoneBookMachine.ts",
    })

    expect(result.messages).toEqual([
      expect.objectContaining({ fatal: true, severity: 2 }),
    ])
  })
})

describe("lint scope boundaries", () => {
  it("keeps the lint command rooted at the repository", () => {
    expect(packageManifest.scripts.lint).toBe("eslint .")
  })

  it.each([
    ".next/types/fixture.ts",
    "next-env.d.ts",
    "out/fixture.ts",
    "coverage/fixture.ts",
    "playwright-report/fixture.ts",
    "test-results/fixture.ts",
    "repomix-temp.private.ts",
    "reference/private.ts",
  ])("keeps generated or private file %s ignored", async (filePath) => {
    expect(await eslint.isPathIgnored(filePath)).toBe(true)
  })

  it("does not apply TypeScript import rules to JavaScript tooling", async () => {
    const [result] = await eslint.lintText('require("node:fs")', {
      filePath: "lintProbe.cjs",
    })

    expect(result.messages).toEqual([])
  })
})

describe("Tailwind component styling", () => {
  const filePath = "components/ThemeToggle.tsx"

  it("reports a component styling library, a CSS Module and inline layout", async () => {
    const [result] = await eslint.lintText(
      `import "@mui/material/Button"
import "./panel.module.css"
export const panel = <div style={{ padding: 4 }} />`,
      { filePath },
    )

    expect(result.messages.map(({ ruleId }) => ruleId)).toEqual([
      "no-restricted-imports",
      "no-restricted-imports",
      "no-restricted-syntax",
    ])
  })

  it("accepts the Tailwind entry point and a runtime custom property", async () => {
    const [result] = await eslint.lintText(
      `import "@/styles/globals.css"
import type { CSSProperties } from "react"
export const Meter = ({ width }: { width: string }) => <div className="w-(--meter-width)" style={{ "--meter-width": width } as CSSProperties} />`,
      { filePath },
    )

    expect(result.messages).toEqual([])
  })
})
