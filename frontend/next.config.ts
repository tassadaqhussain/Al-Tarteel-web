import type { NextConfig } from 'next';
import createBundleAnalyzer from '@next/bundle-analyzer';
import { getSurahSlug } from './src/lib/surah-meta';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  agentRules: false,
  async redirects() {
    return [
      { source: '/surah', destination: '/surahs', statusCode: 301 },
      ...Array.from({ length: 114 }, (_, index) => {
        const number = index + 1;
        return { source: `/surah/${number}`, destination: `/${getSurahSlug(number)}`, statusCode: 301 };
      }),
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:key([A-Za-z0-9-]{8,128}).txt',
          destination: '/api/indexnow/key?key=:key',
        },
      ],
    };
  },
  output: 'standalone',
  reactStrictMode: true,
  env: {
    // Do not hardcode localhost — a production build with a blank env used to bake
    // http://localhost:4000 into the browser bundle. Prefer compose --env-file value;
    // empty lets the client fall back to same-origin /api/v1.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    qualities: [75, 90, 95],
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
