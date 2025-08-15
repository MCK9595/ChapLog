/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better Aspire integration
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  async rewrites() {
    // .NET Aspire Service Discovery経由でAPIプロキシ設定
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBaseUrl) {
      console.warn('NEXT_PUBLIC_API_BASE_URL not set. API proxy disabled.');
      return [];
    }

    console.log('Next.js API Proxy configured for:', apiBaseUrl);
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`
      }
    ];
  }
};

module.exports = nextConfig;