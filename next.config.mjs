/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/results',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/results',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
