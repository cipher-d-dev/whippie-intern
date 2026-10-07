import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Disable service-worker generation in development to avoid caching confusion
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

export default pwaConfig(nextConfig);
