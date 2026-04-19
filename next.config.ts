import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "apiv2.comradeconnect.co.zw",
      },
      {
        protocol: "https",
        hostname: "storage.com", // Placeholder from docs
      },
    ],
  },
};

export default nextConfig;
