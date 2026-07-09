import gitignore from "eslint-config-flat-gitignore"
import nextConfig from "eslint-config-next"
import prettierConfig from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"

export default [
  gitignore(),
  ...nextConfig,
  prettierConfig,
  {
    plugins: {
      "only-warn": onlyWarn,
    },
  },
]
