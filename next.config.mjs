import withPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  // Face library and models never change for a given version: cache for a year.
  async headers() {
    return [
      {
        source: "/noprecache/face/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/auth/verify-email",
        destination: "/verify-email",
      },
      {
        source: "/auth/reset-password",
        destination: "/reset-password",
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Custom worker file — merged into the generated SW; handles push events
  customWorkerSrc: "worker",
  // Disable service-worker generation in development to avoid caching confusion
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);
