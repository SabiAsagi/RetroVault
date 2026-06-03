/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Admin domain routing
        // This will route admin.retrovault.kr to the /admin folder
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'admin.retrovault.kr',
            },
          ],
          destination: '/admin/:path*',
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
