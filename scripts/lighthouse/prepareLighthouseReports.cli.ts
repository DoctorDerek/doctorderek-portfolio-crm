import path from "node:path"
import { prepareLighthouseReports } from "@/scripts/lighthouse/prepareLighthouseReports"

const resultsDirectory = path.resolve(
  process.env.LIGHTHOUSE_RESULTS_DIRECTORY ?? "lighthouse-results",
)
const publishedDirectory = process.env.LIGHTHOUSE_PUBLISHED_DIRECTORY
  ? path.resolve(process.env.LIGHTHOUSE_PUBLISHED_DIRECTORY)
  : undefined
prepareLighthouseReports({ publishedDirectory, resultsDirectory })
