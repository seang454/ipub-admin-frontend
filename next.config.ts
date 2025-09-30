import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["as1.ftcdn.net"], // whitelist the host
  },
  experimental: {
    optimizeCss: true, // Enable CSS optimization
  },
};

export default nextConfig;
