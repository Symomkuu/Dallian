import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl = (
    rawSiteUrl && rawSiteUrl.startsWith('http') ? rawSiteUrl : 'https://dallian.online'
  ).replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/customer',
          '/api',
          '/checkout',
          '/cart',
          '/wishlist',
          '/order-confirmed',
          '/track',
          '/login',
          '/register',
          '/signup',
          '/forgot',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}