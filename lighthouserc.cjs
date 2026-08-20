const productionUrl = "https://portfolio-crm.doctorderek.com/"
const productionRunCount = 5
const targetUrl = process.env.LIGHTHOUSE_TARGET_URL ?? productionUrl
const numberOfRuns = Number.parseInt(
  process.env.LIGHTHOUSE_NUMBER_OF_RUNS ?? `${productionRunCount}`,
  10,
)
const outputDirectory =
  process.env.LIGHTHOUSE_OUTPUT_DIRECTORY ?? "./lighthouse-results"
const trustedOidcToken = process.env.LIGHTHOUSE_VERCEL_TRUSTED_OIDC_TOKEN

if (!Number.isInteger(numberOfRuns) || numberOfRuns < 1)
  throw new Error("LIGHTHOUSE_NUMBER_OF_RUNS must be a positive integer.")

module.exports = {
  ci: {
    collect: {
      url: [targetUrl],
      numberOfRuns,
      settings: {
        formFactor: "mobile",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
        ...(trustedOidcToken
          ? {
              extraHeaders: JSON.stringify({
                "x-vercel-trusted-oidc-idp-token": trustedOidcToken,
              }),
            }
          : {}),
      },
    },
    upload: {
      target: "filesystem",
      outputDir: outputDirectory,
    },
  },
}
