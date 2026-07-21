import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/",
  },
})({
  reactStrictMode: true,
  allowedDevOrigins: ["10.7.134.234", "localhost"],
});

export default nextConfig;
