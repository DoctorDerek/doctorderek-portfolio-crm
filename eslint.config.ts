import gitignore from "eslint-config-flat-gitignore"
import nextConfig from "eslint-config-next"
import prettierConfig from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"

/**
 * ONE-TIME EXCEPTION TO NO CODE COMMENT RULE:
 * typescript-eslint (v8.63.0) is broken with TypeScript 7 (v7.0.2)
 * TODO Restore typescript-eslint rules as soon as possible!!
 * */
const filteredNextConfig = nextConfig.filter(
  (config) => config.name !== "next/typescript",
)

export default [
  gitignore(),
  ...filteredNextConfig,
  prettierConfig,
  {
    plugins: {
      "only-warn": onlyWarn,
    },
  },
]
