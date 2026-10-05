import React from 'react';
import type { Metadata } from 'next';
import { CategoriesPageClient } from '@/components/CategoriesPageClient';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Wig Collections & Categories | Dallian Luxe Hair Nairobi',
  description:
    'Explore our luxury wig collections in Nairobi: 100% Virgin Human Hair and Japanese Futura synthetic  wigs across all lengths and textures.',
  keywords: [
    'human hair wigs in nairobi',
    'virgin human hair categories',
    'japanese futura  wigs kenya',
    'bone straight wigs kenya',
    'deep wave curly wigs nairobi',
    'body wave wigs kenya',
    'bob wigs nairobi',
    'wig textures and styles kenya',
  ],
  alternates: {
    canonical: 'https://dallian.online/categories',
  },
  openGraph: {
    title: 'Wig Collections & Categories | Dallian Luxe Hair Nairobi',
    description:
      'Explore our luxury wig collections in Nairobi: 100% Virgin Human Hair and Japanese Futura synthetic  wigs across all lengths and textures.',
    url: 'https://dallian.online/categories',
    siteName: brand.name,
    images: [
      {
        url: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair Categories Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wig Collections & Categories | Dallian Luxe Hair Nairobi',
    description: 'Explore 100% Virgin Human Hair and Futura wig collections at Dallian Luxe Hair.',
    images: ['https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

export default function CategoriesPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Wig Collections & Categories',
    url: 'https://dallian.online/categories',
    description:
      'Curated luxury wig ranges including 100% virgin human hair and high-temperature Japanese Futura synthetic  units.',
    publisher: {
      '@type': 'Organization',
      name: 'Dallian Luxe Hair',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dallian.online/logo.png',
      },
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '100% Virgin Human Hair Wigs',
          url: 'https://dallian.online/shop?category=human-hair',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Japanese Futura  Wigs',
          url: 'https://dallian.online/shop?category=futura',
        },
      ],
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
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
        name: 'Categories',
        item: 'https://dallian.online/categories',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" key="categories-collection-jsonld">
        {JSON.stringify(collectionSchema)}
      </script>
      <script type="application/ld+json" key="categories-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <CategoriesPageClient />
    </>
  );
}
