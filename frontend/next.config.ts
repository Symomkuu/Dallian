import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/news',
        has: [
          {
            type: 'query',
            key: 'category',
            value: '(?<slug>[^&]+)',
          },
        ],
        destination: '/news/category/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;