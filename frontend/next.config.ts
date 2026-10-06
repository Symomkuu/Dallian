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
      // Add your Django/media host here if any images are served from it, e.g.
      // { protocol: "https", hostname: "api.dallian.online", pathname: "/media/**" },
    ],
  },
  async redirects() {
    return [
      {
        // Old /news?category=slug links -> /news/category/slug.
        // (?!all$) leaves /news?category=all alone, so it can't redirect to /news/category/all (404)
        // or loop back to itself. The /news canonical tag handles that URL.
        source: '/news',
        has: [
          {
            type: 'query',
            key: 'category',
            value: '(?<slug>(?!all$)[^&]+)',
          },
        ],
        destination: '/news/category/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;