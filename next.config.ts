import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "realestate-navi.vercel.app" }],
        destination: "https://market.next-aura.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "realestate-market.vercel.app" }],
        destination: "https://market.next-aura.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
