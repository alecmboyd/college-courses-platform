/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'app--alec-boyd-2c353074.base44.app'],
  },
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/signup',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig