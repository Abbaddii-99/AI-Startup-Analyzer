/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep image optimization off for static export compatibility.
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
