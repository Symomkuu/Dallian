import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, Phone, Mail, MapPin } from 'lucide-react';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Privacy Policy | Dallian Luxe Hair Nairobi',
  description:
    'Read our Privacy Policy. Dallian Luxe Hair is dedicated to safeguarding your personal data, M-Pesa transaction security, and privacy in compliance with Kenya Data Protection regulations.',
  alternates: {
    canonical: 'https://dallian.online/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Dallian Luxe Hair Nairobi',
    description:
      'Dallian Luxe Hair is dedicated to safeguarding your personal data, transaction security, and privacy.',
    url: 'https://dallian.online/privacy',
    siteName: 'Dallian Luxe Hair',
    images: [
      {
        url: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair Privacy Policy Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Dallian Luxe Hair Nairobi',
    description: 'Dallian Luxe Hair privacy standards and data protection principles.',
    images: ['https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

export default function PrivacyPage() {
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
        name: 'Privacy Policy',
        item: 'https://dallian.online/privacy',
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    url: 'https://dallian.online/privacy',
    description:
      'Privacy Policy for Dallian Luxe Hair outlining our data practices under the Kenya Data Protection Act, 2019.',
    publisher: {
      '@type': 'Organization',
      name: 'Dallian Luxe Hair',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dallian.online/logo.png',
      },
    },
  };

  return (
    <>
      <script type="application/ld+json" key="privacy-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json" key="privacy-webpage-jsonld">
        {JSON.stringify(webPageSchema)}
      </script>

      <div className="bg-[#FAF7F2] py-8 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#1A1A1A]/50">
            <Link href="/" className="hover:text-[#1A1A1A] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-[#1A1A1A]/80">Privacy Policy</span>
          </nav>

          {/* Header */}
          <div className="text-center">
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C89D34]">
              Data Protection & Trust
            </span>
            <h1 className="mt-3 font-serif text-3xl text-[#1A1A1A] sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-xs text-[#1A1A1A]/60 sm:text-sm">
              Last Updated: March 2026 • Compliant with Kenya Data Protection Act (2019)
            </p>
          </div>

          {/* Key Security Pillars */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs">
              <Shield className="h-6 w-6 text-[#C89D34]" />
              <h3 className="mt-3 font-serif text-base font-semibold text-[#1A1A1A]">Encrypted Data</h3>
              <p className="mt-1 text-xs text-[#1A1A1A]/70">
                256-bit SSL encrypted shopping session protecting every interaction.
              </p>
            </div>

            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs">
              <Lock className="h-6 w-6 text-[#C89D34]" />
              <h3 className="mt-3 font-serif text-base font-semibold text-[#1A1A1A]">Payment Security</h3>
              <p className="mt-1 text-xs text-[#1A1A1A]/70">
                Direct Safaricom M-Pesa STK & certified banking integrations; we never store PINs.
              </p>
            </div>

            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs">
              <Eye className="h-6 w-6 text-[#C89D34]" />
              <h3 className="mt-3 font-serif text-base font-semibold text-[#1A1A1A]">Zero Data Selling</h3>
              <p className="mt-1 text-xs text-[#1A1A1A]/70">
                Your personal details are never sold, rented, or broadcast to third parties.
              </p>
            </div>
          </div>

          {/* Legal Text Sections */}
          <div className="mt-10 space-y-8 rounded-2xl border border-[#1A1A1A]/10 bg-white p-6 shadow-xs sm:p-10">
            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                1. Introduction
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                Dallian Luxe Hair (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), operating in Nairobi, Kenya, values your personal privacy. This Privacy Policy outlines how we collect, use, store, and safeguard personal information when you visit{' '}
                <Link href="/" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                  dallian.online
                </Link>{' '}
                or place orders for luxury hair units, accessories, and{' '}
                <Link href="/services" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                  studio services
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                2. Information We Collect
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                To fulfill orders and offer concierge assistance, we collect:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[#1A1A1A]/75">
                <li>
                  <strong>Contact Details:</strong> Full name, phone number, email address, and delivery location.
                </li>
                <li>
                  <strong>Order History:</strong> Hair textures, cap sizes, customized lengths, and styling notes.
                </li>
                <li>
                  <strong>Payment Verification:</strong> M-Pesa transaction reference IDs, confirmation timestamps, and billing receipts.
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, device type, browser settings, and browsing navigation via anonymized analytics.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                3. Purpose of Processing
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                We process your data for the following lawful purposes:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[#1A1A1A]/75">
                <li>
                  Processing, packing, and dispatching your orders with courier partners as outlined in our{' '}
                  <Link href="/delivery" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                    Delivery Policy
                  </Link>
                  .
                </li>
                <li>
                  Providing SMS and WhatsApp tracking updates via our{' '}
                  <Link href="/track" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                    Order Tracking system
                  </Link>
                  .
                </li>
                <li>
                  Handling returns, exchanges, and warranty inquiries in line with our{' '}
                  <Link href="/returns" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                    Returns Policy
                  </Link>
                  .
                </li>
                <li>Complying with statutory Kenyan tax, accounting, and consumer protection requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                4. Data Protection & Sharing
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                We implement robust physical, technical, and managerial safeguards to protect your personal information against unauthorized access. We only share delivery details with vetted courier drivers strictly for fulfillment. We do not sell or monetize client databases under any circumstances.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                5. Your Legal Rights
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                Under the Data Protection Act (Kenya, 2019), you have the right to request access to the personal information we hold about you, request rectification of any inaccurate information, or request deletion of your account record by contacting our Data Officer.
              </p>
            </section>

            <section className="border-t border-[#1A1A1A]/10 pt-6">
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                6. Contact Our Privacy Concierge
              </h2>
              <p className="mt-2 text-sm text-[#1A1A1A]/75">
                For questions regarding this policy or to exercise your data rights, reach out directly or review our{' '}
                <Link href="/terms" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                  Terms & Conditions
                </Link>
                :
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-[#1A1A1A]/85 sm:flex-row sm:gap-8">
                <a href={`mailto:${brand.email}`} className="flex items-center gap-2 hover:text-[#C89D34]">
                  <Mail className="h-4 w-4 text-[#C89D34]" />
                  <span>{brand.email}</span>
                </a>
                <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-[#C89D34]">
                  <Phone className="h-4 w-4 text-[#C89D34]" />
                  <span>{brand.phone}</span>
                </a>
                <Link href="/contact" className="flex items-center gap-2 hover:text-[#C89D34]">
                  <MapPin className="h-4 w-4 text-[#C89D34]" />
                  <span>Mountain Mall Studio</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
