import withPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
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
