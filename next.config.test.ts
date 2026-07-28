import { describe, expect, it } from "vitest"
import nextConfig from "@/next.config"

describe("next image configuration", () => {
  it("limits contact avatar transformations to stable, optimized variants", () => {
    expect(nextConfig.images).toEqual({
      deviceSizes: [160],
      imageSizes: [80],
      minimumCacheTTL: 2678400,
      formats: ["image/webp"],
      qualities: [75],
      localPatterns: [{ pathname: "/contacts/**" }],
    })
  })
})
