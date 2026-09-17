/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.wikipedia.org',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org',
      },
    ],
  },
};

module.exports = nextConfig;
