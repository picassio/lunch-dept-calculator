import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PORT: process.env.PORT || '3000',
    HOST: process.env.HOST || '0.0.0.0'
  }
};

export default nextConfig;
