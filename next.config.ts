import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/**/*': ['./db/custom.db', './db/**/*'],
    '/api/**/*': ['./db/custom.db', './db/**/*'],
  },
};

export default nextConfig;



