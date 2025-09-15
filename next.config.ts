import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["as1.ftcdn.net"], // whitelist the host
  },
};

export default nextConfig;
