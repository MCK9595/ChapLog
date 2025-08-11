/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better Aspire integration
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

module.exports = nextConfig;