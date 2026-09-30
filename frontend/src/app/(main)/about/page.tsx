import React from 'react';
import type { Metadata } from 'next';
import { AboutPageClient } from '@/components/AboutPageClient';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'About Us | Dallian Luxe Hair Nairobi - Luxury Human Hair Wigs & Craftsmanship',
  description:
    'Learn about Dallian Luxe Hair in Nairobi, Kenya. Our mission is delivering 100% virgin human hair wigs, HD lace frontals, bespoke salon services, and effortless elegance.',
  keywords: [
    'about dallian luxe hair',
    'luxury wig store nairobi',
    'human hair wig maker kenya',
    'best wig shop in nairobi',
    'wig salon mountain mall thika road',
    'virgin human hair suppliers nairobi',
    'hd lace wigs kenya',
  ],
  alternates: {
    canonical: 'https://dallian.online/about',
  },
  openGraph: {
    title: 'About Us | Dallian Luxe Hair Nairobi - Luxury Human Hair Wigs & Craftsmanship',
    description:
      'Learn about Dallian Luxe Hair in Nairobi, Kenya. Our mission is delivering 100% virgin human hair wigs, HD lace frontals, bespoke salon services, and effortless elegance.',
    url: 'https://dallian.online/about',
    siteName: brand.name,
    images: [
      {
        url: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'About Dallian Luxe Hair Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Dallian Luxe Hair Nairobi',
    description:
      'Discover the story, craftsmanship, and luxury human hair standards at Dallian Luxe Hair Nairobi.',
    images: ['https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

export default function AboutPage() {
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Dallian Luxe Hair',
    url: 'https://dallian.online/about',
    description:
      'Dallian Luxe Hair is a premier luxury wig brand and studio boutique in Nairobi, Kenya, specializing in 100% virgin human hair, Japanese Futura, HD lace frontals, and custom styling.',
    mainEntity: {
      '@type': 'HairSalon',
      name: 'Dallian Luxe Hair',
      image: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
      logo: 'https://dallian.online/logo.png',
      url: 'https://dallian.online',
      telephone: '+254792114292',
      email: 'dallianltd@gmail.com',
      priceRange: 'KES 5,000 - 65,000',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Mountain Mall, Thika Road',
        addressLocality: 'Nairobi',
        addressRegion: 'Nairobi County',
        postalCode: '00100',
        addressCountry: 'KE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -1.2291,
        longitude: 36.8833,
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
          dayOfWeek: ['Saturday'],
          opens: '09:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday'],
          opens: '11:00',
          closes: '16:00',
        },
      ],
      sameAs: [
        'https://www.facebook.com/profile.php?id=61594105355729',
        'https://www.tiktok.com/@dallian.luxe.hair',
        'https://www.instagram.com/dallian.luxe.hair/',
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
        name: 'About Us',
        item: 'https://dallian.online/about',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" key="about-schema-jsonld">
        {JSON.stringify(aboutPageSchema)}
      </script>
      <script type="application/ld+json" key="about-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <AboutPageClient />
    </>
  );
}