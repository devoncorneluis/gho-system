import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "llwaxsyemjlcjyvhnptr.supabase.co",
      },
    ],
  },
};

export default nextConfig;