/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add external packages
  serverExternalPackages: ['pdf-parse', 'pdf.js-extract'],

  // These are still valid options
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
