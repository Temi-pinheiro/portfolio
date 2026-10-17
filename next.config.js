/** @type {import('next').NextConfig} */
const nextConfig = {
  // The article Open Graph image route reads src/content at request time for
  // slugs that were not prerendered, so the folder must ship with its function.
  outputFileTracingIncludes: {
    '/articles/**': ['./src/content/articles/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
