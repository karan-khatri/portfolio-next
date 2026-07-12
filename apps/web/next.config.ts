import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@portfolio/db", "@portfolio/sections"],
};

export default nextConfig;
