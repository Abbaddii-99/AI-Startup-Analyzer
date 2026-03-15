/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: require('path').resolve(__dirname, '../..'),
  },
  reactStrictMode: true,
  // Disable build-time type checking — handled separately by tsc --noEmit
  // Avoids jest-worker EPERM kill errors on Windows with Node.js v22
  typescript: { ignoreBuildErrors: true },
  // standalone is enabled in Docker via NEXT_OUTPUT=standalone env var
  ...(process.env.NEXT_OUTPUT === 'standalone' && { output: 'standalone' }),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
