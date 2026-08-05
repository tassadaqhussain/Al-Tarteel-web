import type { NextConfig } from 'next';
import { getSurahSlug } from './src/lib/surah-meta';

const nextConfig: NextConfig = {
  async redirects() {
    return Array.from({ length: 114 }, (_, index) => {
      const number = index + 1;
      return { source: `/surah/${number}`, destination: `/${getSurahSlug(number)}`, permanent: true };
    });
  },
  output: 'standalone',
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
