import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, FileCheck, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Dallian Luxe Hair Nairobi',
  description:
    'Read the official Terms and Conditions for purchases, salon bookings, and customer agreements at Dallian Luxe Hair in Nairobi, Kenya.',
  alternates: {
    canonical: 'https://dallian.online/terms',
  },
  openGraph: {
    title: 'Terms & Conditions | Dallian Luxe Hair Nairobi',
    description:
      'Official Terms and Conditions for purchases, salon bookings, and customer agreements at Dallian Luxe Hair.',
    url: 'https://dallian.online/terms',
    siteName: 'Dallian Luxe Hair',
    images: [
      {
        url: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair Terms and Conditions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | Dallian Luxe Hair Nairobi',
    description: 'Terms and Conditions for Dallian Luxe Hair online and salon services.',
    images: ['https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

export default function TermsPage() {
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
        name: 'Terms & Conditions',
        item: 'https://dallian.online/terms',
      },
    ],
  };

  const termsSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms and Conditions',
    url: 'https://dallian.online/terms',
    description:
      'Official Terms and Conditions governing website usage, product orders, and studio appointments at Dallian Luxe Hair.',
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
      <script type="application/ld+json" key="terms-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json" key="terms-webpage-jsonld">
        {JSON.stringify(termsSchema)}
      </script>

      <div className="bg-[#FAF7F2] py-8 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#1A1A1A]/50">
            <Link href="/" className="hover:text-[#1A1A1A] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-[#1A1A1A]/80">Terms & Conditions</span>
          </nav>

          {/* Header */}
          <div className="text-center">
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C89D34]">
              Service Agreement
            </span>
            <h1 className="mt-3 font-serif text-3xl text-[#1A1A1A] sm:text-5xl">
              Terms & Conditions
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-xs text-[#1A1A1A]/60 sm:text-sm">
              Effective Date: March 2026 • Governing Law: Republic of Kenya
            </p>
          </div>

          {/* Core Principles */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs">
              <Scale className="h-6 w-6 text-[#C89D34]" />
              <h3 className="mt-3 font-serif text-base font-semibold text-[#1A1A1A]">Fair Trading</h3>
              <p className="mt-1 text-xs text-[#1A1A1A]/70">
                Transparent pricing, authentic hair specifications, and verified customer rights.
              </p>
            </div>

            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs">
              <FileCheck className="h-6 w-6 text-[#C89D34]" />
              <h3 className="mt-3 font-serif text-base font-semibold text-[#1A1A1A]">Guaranteed Quality</h3>
              <p className="mt-1 text-xs text-[#1A1A1A]/70">
                Rigorous double-drawn virgin human hair grading with full provenance integrity.
              </p>
            </div>

            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs">
              <Shield className="h-6 w-6 text-[#C89D34]" />
              <h3 className="mt-3 font-serif text-base font-semibold text-[#1A1A1A]">Consumer Protection</h3>
              <p className="mt-1 text-xs text-[#1A1A1A]/70">
                Strict adherence to the Consumer Protection Act and Kenyan legal standards.
              </p>
            </div>
          </div>

          {/* Agreement Clauses */}
          <div className="mt-10 space-y-8 rounded-2xl border border-[#1A1A1A]/10 bg-white p-6 shadow-xs sm:p-10">
            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                1. Agreement to Terms
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                By accessing, browsing, or purchasing from Dallian Luxe Hair (&quot;dallian.online&quot; or &quot;the Studio&quot;), you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions. For data privacy standards, please consult our{' '}
                <Link href="/privacy" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                2. Product Authenticity & Specifications
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                We make every effort to display textures, lace clarity, hair densities, and color tones as accurately as possible across our{' '}
                <Link href="/shop" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                  product catalog
                </Link>
                . However, because our pieces are handcrafted from 100% natural human hair and displayed across varying monitor calibrations, slight natural variance in sheen or shade may occur.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                3. Pricing, Delivery & Returns
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                All prices listed on the website are in <strong>Kenyan Shillings (KES)</strong>. Dispatch timelines, courier zones, and rates are governed by our{' '}
                <Link href="/delivery" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                  Delivery & Shipping Policy
                </Link>
                . Returns and exchanges are subject to the strict hygiene and 7-day criteria detailed in our{' '}
                <Link href="/returns" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                  Returns & Exchanges Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                4. Orders & Payment Processing
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                Orders are confirmed upon successful payment verification via M-Pesa STK Push, Card, or approved bank transfer. Active shipments can be tracked in real-time through our{' '}
                <Link href="/track" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                  Order Tracking portal
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                5. Studio Services & Appointments
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                For in-person appointments at our Mountain Mall location (including custom fitting, wig revamp, coloring, and lace replacement as detailed in our{' '}
                <Link href="/services" className="text-[#C89D34] underline hover:text-[#1A1A1A]">
                  Studio Services
                </Link>
                ):
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[#1A1A1A]/75">
                <li>Please arrive within 15 minutes of your scheduled booking slot.</li>
                <li>Cancellations or rescheduling requests should be communicated at least 4 hours in advance via phone or WhatsApp.</li>
                <li>Wigs submitted for revamp or styling services must be collected within 14 business days of completion notice.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A] sm:text-2xl">
                6. Limitation of Liability & Governing Law
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
                These terms are governed by and construed in accordance with the Laws of Kenya. Any disputes arising in connection with transactions shall be subject to the jurisdiction of the competent courts in Nairobi, Kenya.
              </p>
            </section>

            <section className="border-t border-[#1A1A1A]/10 pt-6">
              <h2 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                7. Official Contact
              </h2>
              <div className="mt-4 grid gap-4 text-sm text-[#1A1A1A]/85 sm:grid-cols-3">
                <Link href="/contact" className="flex items-center gap-2 hover:text-[#C89D34]">
                  <MapPin className="h-4 w-4 shrink-0 text-[#C89D34]" />
                  <span>Mountain Mall, Thika Rd</span>
                </Link>
                <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-[#C89D34]">
                  <Phone className="h-4 w-4 shrink-0 text-[#C89D34]" />
                  <span>0792 11 42 92</span>
                </a>
                <a href={`mailto:${brand.email}`} className="flex items-center gap-2 hover:text-[#C89D34]">
                  <Mail className="h-4 w-4 shrink-0 text-[#C89D34]" />
                  <span>dallianltd@gmail.com</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
