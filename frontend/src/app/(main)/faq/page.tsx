import React from 'react';
import type { Metadata } from 'next';
import { FaqPageClient } from '@/components/FaqPageClient';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Dallian Luxe Hair Nairobi',
  description:
    'Find answers to common questions about virgin human hair wigs, japanese Futura wigs, cap sizing, same-day Nairobi delivery, studio visits, and return policies.',
  alternates: {
    canonical: 'https://dallian.online/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | Dallian Luxe Hair Nairobi',
    description:
      'Find answers to common questions about virgin human hair wigs, Futura wigs, cap sizing, same-day Nairobi delivery, and returns.',
    url: 'https://dallian.online/faq',
    siteName: brand.name,
    images: [
      {
        url: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair FAQ Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | Dallian Luxe Hair Nairobi',
    description: 'Frequently Asked Questions about human hair wigs, Japanese Futura wigs, care, and delivery in Kenya.',
    images: ['https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What types of wigs do you sell at Dallian Luxe Hair?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We specialise in two premium ranges: 100% Virgin Human Hair wigs with aligned cuticles, and Japanese Futura heat-resistant wigs.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is 100% Virgin Human Hair?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our virgin human hair wigs are crafted with real unprocessed donor hair where cuticles remain intact and unidirectional. They can be washed, bleached, colored, blow-dried, and heat-styled just like natural hair.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Japanese Futura wigs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Futura is an advanced synthetic fibre used in luxury wig making that retains styled memory flawlessly and is heat-friendly up to 180°C.',
        },
      },
      {
        '@type': 'Question',
        name: 'How fast is delivery in Nairobi and nationwide across Kenya?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We provide same-day express rider dispatch (2 to 5 hours) for orders within Nairobi, and 24 to 48 hours nationwide courier delivery via G4S and Fargo across all 47 counties in Kenya.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is your physical salon studio located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our flagship studio is located at Mountain Mall, Thika Road, Nairobi, Kenya. We are open Monday through Saturday from 9:00 AM to 7:00 PM, and Sunday from 11:00 AM to 4:00 PM.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is your wig exchange policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer a 7-day exchange window for unworn, unaltered units with uncut lace and original satin packaging intact.',
        },
      },
    ],
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
        name: 'FAQ',
        item: 'https://dallian.online/faq',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" key="faq-page-jsonld">
        {JSON.stringify(faqSchema)}
      </script>
      <script type="application/ld+json" key="faq-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <FaqPageClient />
    </>
  );
}