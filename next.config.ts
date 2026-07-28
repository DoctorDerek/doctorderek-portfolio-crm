import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    deviceSizes: [160],
    imageSizes: [80],
    minimumCacheTTL: 2678400,
    formats: ["image/webp"],
    qualities: [75],
    localPatterns: [{ pathname: "/contacts/**" }],
  },
}

export default nextConfig
