import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow scraping from Miami-Dade Fire CAD
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
