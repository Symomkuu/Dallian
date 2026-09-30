import React from 'react';
import type { Metadata } from 'next';
import { HomePageClient } from '@/components/HomePageClient';

export const metadata: Metadata = {
  title: 'Dallian Luxe Hair | Premium Virgin Human Hair & Japanese Futura Wigs Nairobi',
  description:
    'Discover 100% raw virgin human hair wigs, HD lace frontals, and heat-resistant Japanese Futura fibre wigs in Nairobi. Visit our salon studio at Mountain Mall, Thika Road for expert wig installation, laundry, and custom styling.',
  keywords: [
    'Wigs Nairobi',
    'Human Hair Wigs Kenya',
    'Japanese Futura Fibre Wigs',
    'HD Lace Frontal Nairobi',
    'Wig Installation Mountain Mall',
    'Wig Laundry Nairobi',
    'Wig Revamping Kenya',
    'Glueless Wigs Nairobi',
    'Virgin Human Hair Kenya',
    'Best Wig Shop Nairobi',
    'Dallian Luxe Hair',
    'Wig Salon Mountain Mall',
    'Lace Melt Kenya',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Dallian Luxe Hair | Premium Wigs, Weaves & Studio Services Nairobi',
    description:
      'Shop salon-grade human hair wigs and Japanese Futura fibre pieces in Kenya. In-studio HD lace melting, custom wig laundry, and doorstep delivery across Nairobi.',
    url: '/',
    siteName: 'Dallian Luxe Hair',
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: '/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair - Luxury Wigs and Studio Care in Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dallian Luxe Hair | Luxury Wigs & Studio Care Nairobi',
    description:
      'Shop 100% virgin human hair and Futura fibre wigs. Professional wig installation & laundry at Mountain Mall, Nairobi.',
    images: ['/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

export default function Page() {
  return <HomePageClient />;
}