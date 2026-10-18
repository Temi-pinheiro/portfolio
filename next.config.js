/** @type {import('next').NextConfig} */
const nextConfig = {
  // Page transitions: React's <ViewTransition> animates navigations
  // (components/PageTransition, styles in globals.css).
  experimental: {
    viewTransition: true,
  },
  // The article Open Graph image route reads src/content and the fonts in
  // src/assets at request time for slugs that were not prerendered, so both
  // folders must ship with its function.
  outputFileTracingIncludes: {
    '/articles/**': ['./src/content/articles/**/*', './src/assets/fonts/*.ttf'],
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
