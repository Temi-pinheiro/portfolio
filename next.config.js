/** @type {import('next').NextConfig} */
const nextConfig = {
  // Page transitions: React's <ViewTransition> animates navigations
  // (components/PageTransition, styles in globals.css).
  experimental: {
    viewTransition: true,
  },
  // A Deploy Preview's own address, empty everywhere else. The guide's
  // download email uses it, so a test purchase on a preview links back to
  // that preview rather than to production.
  env: {
    DEPLOY_PREVIEW_URL:
      process.env.CONTEXT === 'deploy-preview' ? process.env.DEPLOY_PRIME_URL || '' : '',
  },
  // The article Open Graph image route reads src/content and the fonts in
  // src/assets at request time for slugs that were not prerendered, so both
  // folders must ship with its function.
  outputFileTracingIncludes: {
    '/articles/**': ['./src/content/articles/**/*', './src/assets/fonts/*.ttf'],
  },
  async redirects() {
    return [
      // The Netlify address served a full copy of the site. Deploy Previews
      // live on other hosts (deploy-preview-N--…), so they're untouched.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'melodious-babka-ea0c89.netlify.app' }],
        destination: 'https://temipinheiro.com/:path*',
        permanent: true,
      },
      // The v3 site served the résumé here until 2026-10-19; old links and
      // CVs still point at it. The archive keeps it.
      {
        source: '/resume.pdf',
        destination: 'https://archive.temipinheiro.com/resume.pdf',
        permanent: true,
      },
    ];
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
