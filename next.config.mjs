/** @type {import('next').NextConfig} */
const isCfPagesExport = process.env.CF_PAGES_BUILD === '1';

const nextConfig = {
  reactStrictMode: true,
  ...(isCfPagesExport ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
