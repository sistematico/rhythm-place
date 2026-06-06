import { execSync } from "node:child_process";
import type { NextConfig } from "next";

function getBuildVersion() {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

const buildVersion = getBuildVersion();
const buildDate = new Date().toISOString();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_VERSION: buildVersion,
    NEXT_PUBLIC_BUILD_DATE: buildDate,
  },
  images: {
    remotePatterns: [
      new URL("https://cdn-images.dzcdn.net/images/**"),
      new URL("https://e-cdns-images.dzcdn.net/images/**"),
    ],
  },
};

export default nextConfig;
