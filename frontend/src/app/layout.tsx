import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Providers } from '@/components/Provider';
import { SiteChrome } from '@/components/SiteChrome';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import ClarityProvider from '@/components/providers/ClarityProvider';
import { brand } from '@/data/brand';
import { jsonLd } from '@/utils/seo';

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'https://dallian.online'
).replace(/\/+$/, '');

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'yqj8xs3j5e';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dallian Luxe Hair | Premium Wigs, Weaves & Studio Services Nairobi',
    // Child pages supply the page name only. Use title: { absolute: '...' } to skip this suffix.
    template: '%s | Dallian Luxe Hair Nairobi',
  },
  // ~155 characters so Google doesn't truncate it
  description:
    'Shop 100% virgin human hair wigs, HD lace frontals and Japanese Futura wigs in Nairobi. Visit our Mountain Mall, Thika Road studio for wig installation.',
  // Note: Google and Bing ignore the keywords meta tag. Kept only for completeness.
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
    'japanese futura wigs',
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
      'Nairobi’s premier destination for raw human hair, Japanese Futura wigs, HD lace melting, and professional wig care at Mountain Mall.',
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
      'Explore luxury virgin human hair, Japanese Futura wigs, and professional salon care in Nairobi at Mountain Mall.',
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

// Defines the @id that blog, category and article schema reference as their publisher.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'HairSalon'],
  '@id': `${siteUrl}/#organization`,
  name: brand.name,
  url: siteUrl,
  logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
  image: `${siteUrl}/shop-hero.jpg`,
  telephone: `+${String(brand.phoneIntl).replace(/\D/g, '')}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Mountain Mall, Thika Road',
    addressLocality: 'Nairobi',
    addressCountry: 'KE',
  },
  // TODO: add openingHoursSpecification, geo and priceRange once you have the real values.
  sameAs: [brand.socials.instagram, brand.socials.tiktok, brand.socials.facebook].filter(Boolean),
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  url: siteUrl,
  name: brand.name,
  inLanguage: 'en-KE',
  publisher: { '@id': `${siteUrl}/#organization` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <script type="application/ld+json">{jsonLd(organizationSchema)}</script>
        <script type="application/ld+json">{jsonLd(websiteSchema)}</script>
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