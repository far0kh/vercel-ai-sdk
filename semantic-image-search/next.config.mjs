/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ibm2y8ia5jdpahxk.public.blob.vercel-storage.com',
        port: '',
      },
    ],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
