/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep image optimization off for static export compatibility.
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ]
  },
}

module.exports = nextConfig
