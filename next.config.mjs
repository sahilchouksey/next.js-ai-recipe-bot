/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
      // Existing patterns below
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
      },
      {
        protocol: 'https', 
        hostname: '**.cloudfront.net',
      },
    ],
    domains: [
      'img.youtube.com',
      'i.ytimg.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/yt-api/:path*',
        destination: 'https://www.googleapis.com/youtube/v3/:path*',
      },
    ];
  },
};

export default nextConfig;
