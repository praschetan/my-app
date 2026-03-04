/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  headers: async () => [
    {
      // Prevent CDN from caching HTML pages with stale JS chunk references
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
      ],
    },
  ],
}

module.exports = nextConfig
