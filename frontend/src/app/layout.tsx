import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Providers } from '@/components/Provider';
import { SiteChrome } from '@/components/SiteChrome';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

import ClarityProvider from '@/components/providers/ClarityProvider';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'https://dallian.online';

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'yqj8xs3j5e';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dallian Luxe Hair | Premium Wigs, Weaves & Studio Services Nairobi',
    template: '%s | Dallian Luxe Hair Nairobi',
  },
  description:
    'Shop 100% virgin human hair wigs, HD lace frontals, and Japanese Futura fibre wigs in Nairobi. Visit our salon studio at Mountain Mall, Thika Road for wig installation, styling, and laundry services.',
  keywords: [
    'human hair wigs in nairobi',
    'wigs in kenya',
    'best wig shop in nairobi',
    'glueless human hair wigs nairobi',
    'hd lace frontal wigs kenya',
    'bone straight wigs kenya',
    'wig revamping in nairobi',
    'wig installation nairobi',
    'wig wash and treatment nairobi',
    'wig customization and plucking',
    'lace replacement kenya',
    '100% virgin human hair wigs',
    'japanese futura fibre wigs',
    'bob wigs nairobi',
    'double drawn hair kenya',
    'wig studio mountain mall thika road',
    'same day wig delivery nairobi',
    'wigs price in kenya',
    'dallian luxe hair',
  ],
  authors: [{ name: 'Dallian Luxe Hair Studio' }],
  creator: 'Dallian Luxe Hair',
  publisher: 'Dallian Luxe Hair',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: siteUrl,
    siteName: 'Dallian Luxe Hair',
    title: 'Dallian Luxe Hair | Premium Wigs, Weaves & Studio Services Nairobi',
    description:
      'Nairobi’s premier destination for raw human hair, Futura fibre wigs, HD lace melting, and professional wig care at Mountain Mall.',
    images: [
      {
        url: '/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair Luxury Wig Collection Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dallian Luxe Hair | Premium Wigs & Studio Services Nairobi',
    description:
      'Explore luxury virgin human hair, Japanese Futura fibre wigs, and professional salon care in Nairobi at Mountain Mall.',
    images: ['/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <ClarityProvider projectId={CLARITY_PROJECT_ID} />
        <Providers>
          <Suspense fallback={null}>
            <SiteChrome>{children}</SiteChrome>
            <FloatingWhatsApp />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}