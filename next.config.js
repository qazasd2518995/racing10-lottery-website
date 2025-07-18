/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize for production
  reactStrictMode: true,
  // Ensure consistent builds
  output: 'standalone',
  generateBuildId: async () => {
    // Use a timestamp-based build ID for consistency
    return Date.now().toString();
  },
  // Disable image optimization for Render deployment
  images: {
    unoptimized: true,
  },
  // Add headers to prevent caching issues
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Disable experimental CSS optimization to avoid critters dependency
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig 