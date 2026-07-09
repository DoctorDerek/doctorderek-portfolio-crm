/**
 * ONE-TIME EXCEPTION TO NO CODE COMMENT RULE:
 * typescript-eslint (v8.63.0) is broken with TypeScript 7 (v7.0.2)
 * until TS 7 releases an API (planned for v7.1.0+)
 * TODO Upgrade to TS 7 when the version is >7.1.0 and typescript-eslint is working with TS7
 * */

import type { Linter } from "eslint"
import gitignore from "eslint-config-flat-gitignore"
import nextConfig from "eslint-config-next"
import prettierConfig from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"

const eslintConfig: Linter.Config[] = [
  gitignore(),
  ...nextConfig,
  prettierConfig,
  {
    plugins: {
      "only-warn": onlyWarn,
    },
  },
]

export default eslintConfig
