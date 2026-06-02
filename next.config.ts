import type { NextConfig } from "next";

const apiBase = process.env.NEXT_PUBLIC_API_BASE;
const apiOrigin = apiBase ? new URL(apiBase).origin : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "www.eternalweddingz.in" },
      { protocol: "https", hostname: "eternalweddingz.in" },
      { protocol: "http", hostname: "localhost", port: "4000" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000" }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" }
        ]
      }
    ];
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    if (!apiBase || !apiOrigin) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/:path*`
      },
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin}/uploads/:path*`
      }
    ];
  }
};

export default nextConfig;
