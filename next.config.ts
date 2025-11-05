import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "kmkcrqlozwmzsgfdgath.supabase.co", 
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.facebook.com",
      },
    ],
  },
};

export default nextConfig;
