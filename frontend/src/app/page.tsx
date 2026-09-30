import React from 'react';
import type { Metadata } from 'next';
import { HomePageClient } from '@/components/HomePageClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Dallian Luxe Hair | Premium Virgin Human Hair & Japanese Futura Wigs Nairobi',
  },
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

const homeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['HairSalon', 'BeautySalon', 'Store'],
      '@id': 'https://dallian.online/#organization',
      name: 'Dallian Luxe Hair',
      url: 'https://dallian.online',
      logo: 'https://dallian.online/logo.png',
      image: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
      description:
        'Premier boutique for 100% raw virgin human hair wigs, HD lace frontals, Japanese Futura fibre wigs, salon installation, and restorative wig laundry in Nairobi.',
      telephone: '+254792114292',
      email: 'dallianltd@gmail.com',
      priceRange: 'KSh 7,000 - KSh 60,000',
      paymentAccepted: ['Cash', 'M-Pesa', 'Credit Card'],
      currenciesAccepted: 'KES',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Mountain Mall, Thika Road',
        addressLocality: 'Nairobi',
        addressCountry: 'KE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -1.2285,
        longitude: 36.8821,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '19:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          opens: '11:00',
          closes: '16:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/dallian.luxe.hair/',
        'https://www.tiktok.com/@dallian.luxe.hair',
        'https://www.facebook.com/profile.php?id=61594105355729',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://dallian.online/#website',
      url: 'https://dallian.online',
      name: 'Dallian Luxe Hair',
      description:
        'Luxury Wigs, HD Lace Frontals, Weaves & Studio Care Services in Nairobi, Kenya',
      publisher: {
        '@id': 'https://dallian.online/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://dallian.online/shop?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(homeSchema)}
      </script>
      <HomePageClient />
    </>
  );
}