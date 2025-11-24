/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'stripe.com',
      'files.stripe.com',
    ],
  },
};

module.exports = nextConfig;

