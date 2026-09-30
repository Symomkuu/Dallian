import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShopPageClient } from '@/components/ShopPageClient';

export const metadata: Metadata = {
  title: 'Shop Premium Wigs, Human Hair & HD Lace Frontals Nairobi',
  description:
    'Browse 100% raw virgin human hair wigs, HD lace frontals, and heat-resistant Japanese Futura fibre wigs in Nairobi. Order online with doorstep delivery across Kenya or pick up at Mountain Mall.',
  keywords: [
    'Buy Wigs Nairobi',
    'Human Hair Wigs Kenya',
    'HD Lace Frontal Nairobi',
    'Japanese Futura Fibre Wigs',
    'Glueless Wigs Kenya',
    'Wig Shop Mountain Mall',
    'Virgin Hair Nairobi',
    'Dallian Luxe Shop',
    'Wigs Catalogue Kenya',
    'Lace Frontal Nairobi',
    'Custom Wigs Kenya',
  ],
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Shop Premium Wigs & Weaves | Dallian Luxe Hair Nairobi',
    description:
      'Explore salon-grade virgin human hair and heat-resistant Futura fibre wigs. In-stock units ready for immediate delivery across Kenya.',
    url: '/shop',
    siteName: 'Dallian Luxe Hair',
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: '/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair Wigs Catalogue Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Luxury Wigs & Human Hair Extensions Nairobi',
    description:
      'Shop 100% virgin human hair & Japanese Futura fibre wigs online at Dallian Luxe Hair.',
    images: ['/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

const shopSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://dallian.online/shop#webpage',
      url: 'https://dallian.online/shop',
      name: 'Shop Luxury Wigs & Human Hair Extensions | Dallian Luxe Hair',
      description:
        'Explore raw virgin human hair wigs, HD lace closures, frontals, and Japanese Futura fibre pieces in Nairobi, Kenya.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://dallian.online/#website',
        url: 'https://dallian.online',
        name: 'Dallian Luxe Hair',
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://dallian.online',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Shop Wigs',
            item: 'https://dallian.online/shop',
          },
        ],
      },
    },
    {
      '@type': 'OfferCatalog',
      '@id': 'https://dallian.online/shop#catalog',
      name: 'Dallian Luxe Hair Wig & Extension Collection',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: '100% Raw Virgin Human Hair Wigs',
          url: 'https://dallian.online/shop?category=human-hair',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Japanese Futura Fibre Wigs',
          url: 'https://dallian.online/shop?category=futura',
        },
      ],
    },
  ],
};

export default function ShopPage() {
  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(shopSchema)}
      </script>
      <Suspense fallback={<div className="min-h-[70vh] bg-cream" />}>
        <ShopPageClient />
      </Suspense>
    </>
  );
}
