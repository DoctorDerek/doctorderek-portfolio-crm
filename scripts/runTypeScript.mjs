import path from "node:path"
import { pathToFileURL } from "node:url"
import { createJiti } from "jiti"

const repositoryDirectory = path.resolve(process.cwd())
const requestedEntry = process.argv[2]
const entryPath = requestedEntry
  ? path.resolve(repositoryDirectory, requestedEntry)
  : ""

if (
  !entryPath ||
  (!entryPath.startsWith(`${repositoryDirectory}${path.sep}`) &&
    entryPath !== repositoryDirectory) ||
  !entryPath.endsWith(".ts")
)
  throw new Error("A repository-local TypeScript entry file is required.")

const jiti = createJiti(import.meta.url, {
  tsconfigPaths: path.join(repositoryDirectory, "tsconfig.json"),
})

await jiti.import(pathToFileURL(entryPath).href)
