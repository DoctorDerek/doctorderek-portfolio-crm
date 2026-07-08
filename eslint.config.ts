import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import type { Linter } from "eslint"
import gitignore from "eslint-config-flat-gitignore"
import globals from "globals"
import { dirname } from "path"
import tseslint from "typescript-eslint"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig: Linter.Config[] = tseslint.config(
  gitignore(),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("plugin:react/recommended"),
  ...compat.extends("plugin:react-hooks/recommended"),
  ...compat.extends("plugin:jsx-a11y/recommended"),
  ...compat.extends("prettier"),
  ...compat.plugins("only-warn"),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
)

export default eslintConfig
