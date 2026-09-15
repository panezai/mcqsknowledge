import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/**': ['./db/custom.db', './prisma/**/*'],
  },
};

export default nextConfig;


