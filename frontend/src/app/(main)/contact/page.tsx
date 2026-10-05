import React from 'react';
import type { Metadata } from 'next';
import { ContactPageClient } from '@/components/ContactPageClient';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Contact Us | Dallian Luxe Hair Nairobi - Mountain Mall Studio & Concierge',
  description:
    'Get in touch with Dallian Luxe Hair in Nairobi. Visit our salon at Mountain Mall, Thika Road, call 0792 11 42 92, chat on WhatsApp, or send an inquiry for custom wigs.',
  keywords: [
    'contact dallian luxe hair',
    'wig shop mountain mall thika road',
    'hair salon mountain mall nairobi',
    'wig shop near me nairobi',
    'custom wig consultation nairobi',
    'wig makers nairobi contact',
    'dallian luxe hair phone number',
  ],
  alternates: {
    canonical: 'https://dallian.online/contact',
  },
  openGraph: {
    title: 'Contact Us | Dallian Luxe Hair Nairobi - Mountain Mall Studio & Concierge',
    description:
      'Visit our salon at Mountain Mall, Thika Road, Nairobi, call 0792 11 42 92, chat on WhatsApp, or send an inquiry for custom wigs.',
    url: 'https://dallian.online/contact',
    siteName: brand.name,
    images: [
      {
        url: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Dallian Luxe Hair Studio Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Dallian Luxe Hair Nairobi',
    description: 'Get directions, store hours, and direct concierge contact for Dallian Luxe Hair.',
    images: ['https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

export default function ContactPage() {
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Dallian Luxe Hair',
    url: 'https://dallian.online/contact',
    description:
      'Contact Dallian Luxe Hair studio at Mountain Mall, Thika Road, Nairobi, Kenya for virgin human hair wigs, HD lace frontals, salon appointments, and inquiries.',
    mainEntity: {
      '@type': 'HairSalon',
      name: 'Dallian Luxe Hair',
      image: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
      logo: 'https://dallian.online/logo.png',
      url: 'https://dallian.online',
      telephone: '+254792114292',
      email: 'dallianltd@gmail.com',
      priceRange: 'KES 5,000 - 65,000',
      hasMap: 'https://maps.google.com/?q=Mountain+Mall,+Thika+Road,+Nairobi',
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
        name: 'Contact Us',
        item: 'https://dallian.online/contact',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" key="contact-schema-jsonld">
        {JSON.stringify(contactPageSchema)}
      </script>
      <script type="application/ld+json" key="contact-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <ContactPageClient />
    </>
  );
}