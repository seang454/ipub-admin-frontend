import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 🎯 Standalone output for Docker (70% smaller images!)
  output: "standalone",

  // 🖼️ Image optimization
  images: {
    domains: ["as1.ftcdn.net"], // whitelist the host
    formats: ["image/avif", "image/webp"], // Modern image formats
  },

  // ⚡ Performance optimizations
  experimental: {
    optimizeCss: true, // Enable CSS optimization
  },

  // 🔒 Security headers for production
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // 🚀 Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"], // Keep errors and warnings
          }
        : false,
  },
};

export default nextConfig;
