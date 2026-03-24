/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable Turbopack due to CPU compatibility issues
    // Falls back to Webpack
    disablePostcssPresetEnv: true,
  },
  // Enable legacy webpack mode
  future: {
    webpack5: true,
  },
  // Disable some features that might cause issues
  images: {
    unoptimized: true,
  },
  // Reduce memory usage
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig