import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {

    remotePatterns: [
      {
        protocol: "https",
        hostname: "apiv2.comradeconnect.co.zw",
      },
      {
        protocol: 'https',
        hostname: 'images.comradeconnect.co.zw',
        port: '',
        pathname: '/**', // This allows all images from this host
      },
    ],
  },
};

export default nextConfig;
