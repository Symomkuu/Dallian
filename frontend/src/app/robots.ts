import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dallian.online';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/customer/*',
          '/api/*',
          '/checkout',
          '/cart',
          '/login',
          '/signup',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
