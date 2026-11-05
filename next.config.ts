import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is an internal admin tool - every page is cookie-gated and reads
  // live backend data, so static prerendering/caching has no upside here.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
