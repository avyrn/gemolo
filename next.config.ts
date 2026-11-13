import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent build failures on hosting providers due to linter warnings
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
