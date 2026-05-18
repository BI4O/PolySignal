import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/data/:path*',
        destination: 'https://data-api.polymarket.com/:path*',
      },
    ]
  },
};

export default nextConfig;
