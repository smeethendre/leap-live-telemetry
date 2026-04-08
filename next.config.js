/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fix for leaflet in Next.js
    config.resolve.fallback = { fs: false };
    return config;
  },
};

module.exports = nextConfig;
