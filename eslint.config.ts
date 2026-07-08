import { FlatCompat } from "@eslint/eslintrc"
import type { Linter } from "eslint"
import gitignore from "eslint-config-flat-gitignore"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig: Linter.Config[] = [
  gitignore(),
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("prettier"),
  ...compat.plugins("only-warn"),
]

export default eslintConfig
