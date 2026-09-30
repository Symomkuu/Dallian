import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2, XCircle, MessageSquare, Phone, Truck, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Returns & Exchange Policy | Dallian Luxe Hair Nairobi',
  description:
    'Read our 7-day luxury wig exchange policy. We guarantee authentic 100% human hair quality with clear, transparent guidelines for hygiene and customer satisfaction in Nairobi, Kenya.',
  alternates: {
    canonical: 'https://dallian.online/returns',
  },
  openGraph: {
    title: 'Returns & Exchange Policy | Dallian Luxe Hair Nairobi',
    description:
      'Read our 7-day luxury wig exchange policy. We guarantee authentic 100% human hair quality with clear, transparent guidelines.',
    url: 'https://dallian.online/returns',
    siteName: 'Dallian Luxe Hair',
    images: [
      {
        url: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair Returns & Exchanges Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Returns & Exchange Policy | Dallian Luxe Hair Nairobi',
    description:
      'Read our 7-day luxury wig exchange policy. We guarantee authentic 100% human hair quality.',
    images: ['https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

export default function ReturnsPage() {
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
        name: 'Returns & Exchanges',
        item: 'https://dallian.online/returns',
      },
    ],
  };

  const returnsFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is your wig return and exchange policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer a 7-day exchange or store credit window from the date of delivery. Because wigs are intimate personal hygiene items, units must be completely unworn, unaltered, with lace uncut and original tags intact.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I start an exchange in Nairobi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Contact our concierge via WhatsApp at +254 792 11 42 92 with your order receipt and clear photos of the unopened unit. You may also visit our Mountain Mall studio in person.',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" key="returns-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json" key="returns-faq-jsonld">
        {JSON.stringify(returnsFaqSchema)}
      </script>

      <div className="bg-[#FAF7F2] py-8 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#1A1A1A]/50">
            <Link href="/" className="hover:text-[#1A1A1A] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-[#1A1A1A]/80">Returns & Exchanges</span>
          </nav>

          {/* Header */}
          <div className="text-center">
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C89D34]">
              Quality Assurance & Client Care
            </span>
            <h1 className="mt-3 font-serif text-3xl text-[#1A1A1A] sm:text-5xl">
              Returns & Exchange Policy
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#1A1A1A]/70 sm:text-base">
              At Dallian Luxe Hair, we are committed to exceptional craftsmanship and complete satisfaction. Please review our hygiene standards and exchange process below.
            </p>
          </div>

          {/* Hygiene Alert Banner */}
          <div className="mt-10 rounded-xl border border-[#C89D34]/30 bg-[#FFFDF9] p-5 shadow-xs sm:p-6">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 h-6 w-6 shrink-0 text-[#C89D34]" />
              <div>
                <h3 className="font-serif text-base font-semibold text-[#1A1A1A] sm:text-lg">
                  Public Health & Personal Hygiene Standards
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#1A1A1A]/75 sm:text-sm">
                  In compliance with global health regulations and Kenya Ministry of Health sanitary guidelines regarding personal hair goods, wigs and hair extensions cannot be restocked once worn, combed, washed, bleached, or with lace trimmed.
                </p>
              </div>
            </div>
          </div>

          {/* Eligible vs Non-Eligible Grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {/* Eligible */}
            <div className="rounded-2xl border border-emerald-900/15 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="h-6 w-6" />
                <h3 className="font-serif text-xl font-semibold">Eligible for Exchange</h3>
              </div>
              <ul className="mt-5 space-y-3 text-xs text-[#1A1A1A]/80 sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                  <span>Request initiated within <strong>7 days</strong> of delivery receipt.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                  <span>HD Lace is 100% uncut, unplucked, and factory intact.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                  <span>Original satin bag, tags, tissue, and gift packaging included.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                  <span>Unworn, unwashed, free of perfumes, dyes, gels, or odor.</span>
                </li>
              </ul>
            </div>

            {/* Ineligible */}
            <div className="rounded-2xl border border-rose-900/15 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex items-center gap-3 text-rose-800">
                <XCircle className="h-6 w-6" />
                <h3 className="font-serif text-xl font-semibold">Ineligible for Exchange</h3>
              </div>
              <ul className="mt-5 space-y-3 text-xs text-[#1A1A1A]/80 sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-700" />
                  <span>Requests made after 7 calendar days of order delivery.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-700" />
                  <span>Lace has been trimmed, styled, glued, or customized.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-700" />
                  <span>Hair has been bleached, colored, cut, or heat-damaged.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-700" />
                  <span>Flash sale or promotional clearance items (marked Final Sale).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3-Step Exchange Process */}
          <div className="mt-12 rounded-2xl border border-[#1A1A1A]/10 bg-white p-6 shadow-xs sm:p-10">
            <h2 className="text-center font-serif text-2xl text-[#1A1A1A] sm:text-3xl">
              Simple 3-Step Exchange Process
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF7F2] font-serif text-lg font-bold text-[#C89D34]">
                  1
                </div>
                <h3 className="mt-4 font-serif text-base font-semibold text-[#1A1A1A]">Contact Concierge</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#1A1A1A]/70">
                  Send your order number and photos of the unit via WhatsApp or email within 7 days.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF7F2] font-serif text-lg font-bold text-[#C89D34]">
                  2
                </div>
                <h3 className="mt-4 font-serif text-base font-semibold text-[#1A1A1A]">Return or Studio Drop</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#1A1A1A]/70">
                  Bring the package to our Mountain Mall studio or send it via trackable rider/courier.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF7F2] font-serif text-lg font-bold text-[#C89D34]">
                  3
                </div>
                <h3 className="mt-4 font-serif text-base font-semibold text-[#1A1A1A]">Inspection & Credit</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#1A1A1A]/70">
                  Following swift 24h quality inspection, your exchange piece is dispatched or store credit issued.
                </p>
              </div>
            </div>
          </div>

          {/* Internal Links Quick Navigation */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <Link
              href="/shop"
              className="group flex flex-col justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-5 transition-all duration-200 hover:border-[#C89D34] hover:shadow-xs"
            >
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <ShoppingBag className="h-5 w-5 text-[#C89D34]" />
                <h3 className="font-serif text-base font-semibold">Browse Wigs</h3>
              </div>
              <p className="mt-2 text-xs text-[#1A1A1A]/65">
                Explore our full virgin human hair and Futura collections for exchange options.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C89D34] group-hover:underline">
                Shop collection <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/delivery"
              className="group flex flex-col justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-5 transition-all duration-200 hover:border-[#C89D34] hover:shadow-xs"
            >
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <Truck className="h-5 w-5 text-[#C89D34]" />
                <h3 className="font-serif text-base font-semibold">Delivery Options</h3>
              </div>
              <p className="mt-2 text-xs text-[#1A1A1A]/65">
                Learn about same-day Nairobi courier and 24-48h nationwide dispatch.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C89D34] group-hover:underline">
                Delivery details <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/services"
              className="group flex flex-col justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-5 transition-all duration-200 hover:border-[#C89D34] hover:shadow-xs"
            >
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <Sparkles className="h-5 w-5 text-[#C89D34]" />
                <h3 className="font-serif text-base font-semibold">Wig Customization</h3>
              </div>
              <p className="mt-2 text-xs text-[#1A1A1A]/65">
                Need your unit custom-fitted, curled, or revitalized at our studio?
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C89D34] group-hover:underline">
                View services <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {/* WhatsApp / Concierge Contact Box */}
          <div className="mt-12 rounded-2xl bg-[#0A0A0A] p-6 text-center text-white sm:p-10">
            <h3 className="font-serif text-2xl text-white sm:text-3xl">
              Questions About Your Order?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Our dedicated client care team is available 6 days a week to guide you through styling, cap measurements, or exchange options.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="https://wa.me/254792114292?text=Hello%20Dallian%20Luxe%20Hair,%20I%20would%20like%20to%20inquire%20about%20a%20product%20exchange."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp Concierge
              </a>
              <a
                href={`tel:${brand.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-[#C89D34] hover:text-[#C89D34]"
              >
                <Phone className="h-4 w-4" />
                Call 0792 11 42 92
              </a>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/50">
              Read our full{' '}
              <Link href="/terms" className="text-[#C89D34] underline hover:text-white">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#C89D34] underline hover:text-white">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
