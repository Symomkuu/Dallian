import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Truck, Clock, ShieldCheck, MapPin, Phone, MessageSquare, CheckCircle2, ArrowRight, PackageSearch, RefreshCw, Sparkles } from 'lucide-react';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Delivery & Shipping Information | Dallian Luxe Hair Nairobi',
  description:
    'Fast, discreet, and secure luxury wig delivery across Nairobi and nationwide throughout Kenya. Same-day rider delivery in Nairobi and 24-48h countrywide courier.',
  alternates: {
    canonical: 'https://dallian.online/delivery',
  },
  openGraph: {
    title: 'Delivery & Shipping Information | Dallian Luxe Hair Nairobi',
    description:
      'Fast, discreet, and secure luxury wig delivery across Nairobi and nationwide throughout Kenya. Same-day rider delivery in Nairobi and 24-48h countrywide courier.',
    url: 'https://dallian.online/delivery',
    siteName: 'Dallian Luxe Hair',
    images: [
      {
        url: 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair Delivery & Shipping Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delivery & Shipping Information | Dallian Luxe Hair Nairobi',
    description:
      'Fast, discreet, and secure luxury wig delivery across Nairobi and nationwide throughout Kenya.',
    images: ['https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
  },
};

const deliveryZones = [
  {
    title: 'Nairobi Express & Same-Day',
    time: '2 - 5 Hours (Same Day for orders before 3 PM)',
    fee: 'KES 200 flat rate (Dedicated Door-to-Door Courier)',
    description:
      'Direct, discreet door-to-door delivery via trusted courier riders to all Nairobi suburbs including Westlands, Kilimani, Karen, Kileleshwa, Runda, CBD, Thika Road, and environs.',
    features: [
      'Live rider tracking & phone coordination',
      'Tamper-evident luxury satin packaging',
      'Same-day delivery for orders placed before 3:00 PM',
    ],
  },
  {
    title: 'Rest of Kenya (Nationwide Courier)',
    time: '24 - 48 Business Hours',
    fee: 'KES 400 flat rate (G4S, Fargo Courier & Speedaf)',
    description:
      'Secure insured shipping to all major Kenyan cities and towns including Mombasa, Kisumu, Nakuru, Eldoret, Thika, Nanyuki, Meru, Machakos, and Malindi.',
    features: [
      'Doorstep or parcel station pick-up option',
      'SMS tracking number dispatch upon handover',
      'Double-boxed protective packaging for transit',
    ],
  },
  {
    title: 'International Shipping (Worldwide)',
    time: '3 - 7 Business Days',
    fee: 'KES 3,500 flat rate (DHL Express / Aramex)',
    description:
      'Express international courier with worldwide door-to-door air freight and end-to-end tracking to USA, UK, Europe, Australia, UAE, Nigeria, South Africa, and worldwide.',
    features: [
      'Full DHL / Aramex international tracking number',
      'Customs clearance and tamper-evident luxury packaging',
      'Expedited priority air delivery',
    ],
  },
  {
    title: 'Complimentary Studio Pick-Up',
    time: 'Ready within 1 - 2 Hours',
    fee: 'FREE of charge',
    description:
      'Collect your bespoke piece directly from our luxury studio at Mountain Mall, Thika Road. Enjoy a complimentary fit check and care consultation with our stylists.',
    features: [
      'Personal fitting and lace cutting on site',
      'Styling tips & custom adjustment by wig specialists',
      'Flexible store hours (Mon - Sat 9:00 AM - 7:00 PM)',
    ],
  },
];

export default function DeliveryPage() {
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
        name: 'Delivery & Shipping',
        item: 'https://dallian.online/delivery',
      },
    ],
  };

  const deliveryFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How fast can I receive my wig in Nairobi and what is the cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Orders placed before 3:00 PM within Nairobi are dispatched for same-day express rider delivery within 2 to 5 hours for a flat fee of KES 200.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you ship wigs outside Nairobi across Kenya?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we ship nationwide across all 47 counties in Kenya via G4S, Fargo Courier, and Speedaf within 24 to 48 hours for a flat fee of KES 400 with real-time tracking.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer international shipping outside Kenya?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We ship worldwide via DHL Express and Aramex within 3 to 7 business days for a flat rate of KES 3,500 with door-to-door tracking.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I pick up my wig directly from your store?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, free studio collection is available at our salon located at Mountain Mall, Thika Road, Nairobi.',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" key="delivery-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json" key="delivery-faq-jsonld">
        {JSON.stringify(deliveryFaqSchema)}
      </script>

      <div className="bg-[#FAF7F2] py-8 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#1A1A1A]/50">
            <Link href="/" className="hover:text-[#1A1A1A] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-[#1A1A1A]/80">Delivery & Shipping</span>
          </nav>

          {/* Header */}
          <div className="text-center">
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C89D34]">
              Discreet & Expedited Logistics
            </span>
            <h1 className="mt-3 font-serif text-3xl text-[#1A1A1A] sm:text-5xl">
              Delivery & Shipping
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#1A1A1A]/70 sm:text-base">
              Every Dallian Luxe Hair unit is packed in our signature luxury satin dust bag and rigid presentation box, ensuring your crowns arrive in pristine runway condition.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <div className="flex items-center gap-4 rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C89D34]/15 text-[#C89D34]">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-serif text-base font-semibold text-[#1A1A1A]">Same-Day Nairobi</p>
                <p className="text-xs text-[#1A1A1A]/60">Dispatched in 2-5 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C89D34]/15 text-[#C89D34]">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="font-serif text-base font-semibold text-[#1A1A1A]">24-48h Nationwide</p>
                <p className="text-xs text-[#1A1A1A]/60">G4S & Fargo countrywide</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C89D34]/15 text-[#C89D34]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-serif text-base font-semibold text-[#1A1A1A]">Discreet Packaging</p>
                <p className="text-xs text-[#1A1A1A]/60">Tamper-proof & luxury box</p>
              </div>
            </div>
          </div>

          {/* Delivery Zones */}
          <div className="mt-12 space-y-6">
            {deliveryZones.map((zone) => (
              <div
                key={zone.title}
                className="overflow-hidden rounded-2xl border border-[#1A1A1A]/10 bg-white p-6 shadow-xs sm:p-8"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h2 className="font-serif text-xl text-[#1A1A1A] sm:text-2xl">{zone.title}</h2>
                  <span className="inline-block rounded-full bg-[#C89D34]/15 px-3.5 py-1 text-xs font-semibold text-[#8C6D1F]">
                    {zone.time}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-[#C89D34]">{zone.fee}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/70">{zone.description}</p>

                <div className="mt-5 border-t border-[#1A1A1A]/5 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/50">
                    What to expect:
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {zone.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-xs text-[#1A1A1A]/80 sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C89D34]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Helpful Navigation Links Grid */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <Link
              href="/track"
              className="group flex flex-col justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-5 transition-all duration-200 hover:border-[#C89D34] hover:shadow-xs"
            >
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <PackageSearch className="h-5 w-5 text-[#C89D34]" />
                <h3 className="font-serif text-base font-semibold">Track Live Order</h3>
              </div>
              <p className="mt-2 text-xs text-[#1A1A1A]/65">
                Check the delivery status of your active order with your order ID.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C89D34] group-hover:underline">
                Track now <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/returns"
              className="group flex flex-col justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-5 transition-all duration-200 hover:border-[#C89D34] hover:shadow-xs"
            >
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <RefreshCw className="h-5 w-5 text-[#C89D34]" />
                <h3 className="font-serif text-base font-semibold">Returns & Exchanges</h3>
              </div>
              <p className="mt-2 text-xs text-[#1A1A1A]/65">
                Review our 7-day hygiene-sealed exchange policy and return criteria.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C89D34] group-hover:underline">
                View policy <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/services"
              className="group flex flex-col justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-5 transition-all duration-200 hover:border-[#C89D34] hover:shadow-xs"
            >
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <Sparkles className="h-5 w-5 text-[#C89D34]" />
                <h3 className="font-serif text-base font-semibold">Studio Services</h3>
              </div>
              <p className="mt-2 text-xs text-[#1A1A1A]/65">
                Book in-person wig revamping, custom styling, or lace replacement in Nairobi.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C89D34] group-hover:underline">
                Explore services <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {/* Track & Support Callout */}
          <div className="mt-12 rounded-2xl bg-[#0A0A0A] p-6 text-white sm:p-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34]">
                  Need Urgent Delivery?
                </span>
                <h3 className="mt-2 font-serif text-2xl text-white sm:text-3xl">
                  Speak Directly With Our Concierge
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Have a photoshoot, wedding, or VIP event happening today? Let us know your preferred timeline and we will arrange a direct dedicated dispatch.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/254792114292?text=Hello%20Dallian%20Luxe%20Hair,%20I%20need%20assistance%20with%20an%20urgent%20wig%20delivery."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                  <a
                    href={`tel:${brand.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-[#C89D34] hover:text-[#C89D34]"
                  >
                    <Phone className="h-4 w-4" />
                    Call 0792 11 42 92
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
                <h4 className="flex items-center gap-2 font-serif text-lg text-white">
                  <MapPin className="h-4 w-4 text-[#C89D34]" />
                  Studio Location
                </h4>
                <p className="mt-2 text-sm text-white/70">
                  Dallian Luxe Hair Studio<br />
                  Mountain Mall, Thika Road<br />
                  Nairobi, Kenya
                </p>
                <p className="mt-4 text-xs text-[#C89D34]">
                  Open Mon – Sat: 9:00 AM – 7:00 PM | Sun: 11:00 AM – 5:00 PM
                </p>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <Link href="/contact" className="text-xs text-[#C89D34] underline hover:text-white">
                    View directions & contact info →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
