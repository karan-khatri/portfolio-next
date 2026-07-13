import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@portfolio/db", "@portfolio/sections"],
  experimental: {
    // Default is 1MB; media uploads (images up to the app-level 8MB cap)
    // need headroom above that.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
