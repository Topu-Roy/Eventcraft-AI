/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "honorable-loris-606.convex.cloud",
        pathname: "/api/storage/**",
      },
      {
        protocol: "https",
        hostname: "cdn.convex.cloud",
      },
    ],
  },
}

export default nextConfig
