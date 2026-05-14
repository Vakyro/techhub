/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
