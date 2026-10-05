import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  Droplets,
  ShieldAlert,
  Wind,
  Layers,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Phone,
  Scissors,
  ShoppingBag,
} from 'lucide-react';
import { careGuide } from '@/data/content';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Wig Care Guide & Longevity Secrets | Dallian Luxe Hair Nairobi',
  description:
    'Comprehensive wig care guide for virgin human hair and Japanese Futura wigs in Kenya. Learn proper washing, detangling, lace maintenance, heat guidelines, and studio care secrets.',
  alternates: {
    canonical: 'https://dallian.online/wig-care',
  },
  openGraph: {
    title: 'Wig Care Guide & Longevity Secrets | Dallian Luxe Hair Nairobi',
    description:
      'Keep your human hair and Futura wigs looking runway-fresh with expert washing, detangling, and storage techniques from Nairobi’s top wig specialists.',
    url: 'https://dallian.online/wig-care',
    siteName: 'Dallian Luxe Hair',
    images: [
      {
        url: 'https://dallian.online/8a3f926d-4483-4271-8809-31d419bde337.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair Wig Care Guide Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wig Care Guide & Longevity Secrets | Dallian Luxe Hair Nairobi',
    description:
      'Expert washing, detangling, heat protection, and storage tips for luxury human hair and Futura wigs.',
    images: ['https://dallian.online/8a3f926d-4483-4271-8809-31d419bde337.jpg'],
  },
};

const careIcons = [
  Droplets,
  Layers,
  Sparkles,
  Wind,
  Scissors,
  ShieldAlert,
  HeartHandshake,
];

const careFaqs = [
  {
    question: 'How often should I wash my human hair wig?',
    answer:
      'We recommend washing your human hair wig every 10 to 15 wears, or whenever product buildup begins to weigh the strands down. Over-washing strips the natural cuticle moisture.',
  },
  {
    question: 'Can I use heat on Japanese Futura wigs?',
    answer:
      'Yes, Japanese Futura wig is heat-friendly up to 180°C (350°F). Always use a ceramic curling wand or flat iron with temperature control, and allow the styled curl to cool in your hand to lock in the shape.',
  },
  {
    question: 'How do I protect my HD lace from tearing or balding?',
    answer:
      'Never scratch or scrub the lace directly. When washing or detangling, hold the hair by the roots and brush from ends upward. Store your piece on a mannequin head or inside your Dallian satin dust bag.',
  },
  {
    question: 'Can Dallian salon studio wash and revamp my wig for me?',
    answer:
      'Yes! We offer full in-studio wig laundry, deep conditioning, lace replacement, and custom restyling at our Mountain Mall salon studio on Thika Road, Nairobi.',
  },
];

export default function WigCarePage() {
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
        name: 'Wig Care Guide',
        item: 'https://dallian.online/wig-care',
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Care for and Wash a Human Hair Wig',
    description:
      'Step-by-step master guide for washing, conditioning, detangling, and maintaining luxury wigs for maximum longevity.',
    image: 'https://dallian.online/8a3f926d-4483-4271-8809-31d419bde337.jpg',
    step: careGuide.map((item, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: item.title,
      text: item.steps.join(' '),
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: careFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" key="care-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json" key="care-howto-jsonld">
        {JSON.stringify(howToSchema)}
      </script>
      <script type="application/ld+json" key="care-faq-jsonld">
        {JSON.stringify(faqSchema)}
      </script>

      <div className="bg-[#FAF7F2] py-8 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#1A1A1A]/50">
            <Link href="/" className="hover:text-[#1A1A1A] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-[#1A1A1A]/80">Wig Care Guide</span>
          </nav>

          {/* Header */}
          <div className="text-center">
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C89D34]">
              Hair Longevity & Maintenance
            </span>
            <h1 className="mt-3 font-serif text-3xl text-[#1A1A1A] sm:text-5xl">
              The Luxury Wig Care Guide
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#1A1A1A]/70 sm:text-base">
              A bespoke wig is an investment in your elegance. Follow our salon-tested care protocols to preserve silky lustre, protect invisible HD lace, and extend the lifespan of your crowns.
            </p>
          </div>

          {/* Golden Rules Banner */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-[#C89D34]/30 bg-white p-6 shadow-xs sm:p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C89D34]/15 text-[#C89D34]">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#1A1A1A]">1. Wash Less Often</h3>
                  <p className="mt-1 text-xs text-[#1A1A1A]/70 leading-relaxed">
                    Wash every 10–15 wears with cool water and sulphate-free shampoo to protect cuticle oils.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C89D34]/15 text-[#C89D34]">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#1A1A1A]">2. Brush Ends First</h3>
                  <p className="mt-1 text-xs text-[#1A1A1A]/70 leading-relaxed">
                    Always detangle from tips upward using a wide-tooth comb to avoid pulling the lace knots.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C89D34]/15 text-[#C89D34]">
                  <Wind className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#1A1A1A]">3. Dry on a Stand</h3>
                  <p className="mt-1 text-xs text-[#1A1A1A]/70 leading-relaxed">
                    Never wring or twist wet hair. Air-dry naturally on a wig stand to maintain cap geometry.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Care Topics Grid */}
          <div className="mt-12 space-y-6">
            {careGuide.map((topic, index) => {
              const Icon = careIcons[index % careIcons.length];

              return (
                <div
                  key={topic.title}
                  className="overflow-hidden rounded-2xl border border-[#1A1A1A]/10 bg-white p-6 shadow-xs sm:p-8"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#C89D34] border border-[#C89D34]/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C89D34]">
                        Step 0{index + 1}
                      </span>
                      <h2 className="font-serif text-xl text-[#1A1A1A] sm:text-2xl">
                        {topic.title}
                      </h2>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2.5 border-t border-[#1A1A1A]/5 pt-5 text-xs text-[#1A1A1A]/80 sm:text-sm">
                    {topic.steps.map((step) => (
                      <li key={step} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C89D34]" />
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* FAQs Accordion */}
          <div className="mt-14 rounded-2xl border border-[#1A1A1A]/10 bg-white p-6 shadow-xs sm:p-10">
            <h2 className="text-center font-serif text-2xl text-[#1A1A1A] sm:text-3xl">
              Frequently Asked Care Questions
            </h2>
            <div className="mt-8 divide-y divide-[#1A1A1A]/10">
              {careFaqs.map((faq) => (
                <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="font-serif text-base font-semibold text-[#1A1A1A] sm:text-lg">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#1A1A1A]/70 sm:text-sm">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <Link
              href="/services"
              className="group flex flex-col justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-5 transition-all duration-200 hover:border-[#C89D34] hover:shadow-xs"
            >
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <Scissors className="h-5 w-5 text-[#C89D34]" />
                <h3 className="font-serif text-base font-semibold">Studio Wig Laundry</h3>
              </div>
              <p className="mt-2 text-xs text-[#1A1A1A]/65">
                Book professional shampooing, silk-press, restyling, or lace repair at our Nairobi studio.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C89D34] group-hover:underline">
                Explore services <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/shop"
              className="group flex flex-col justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-5 transition-all duration-200 hover:border-[#C89D34] hover:shadow-xs"
            >
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <ShoppingBag className="h-5 w-5 text-[#C89D34]" />
                <h3 className="font-serif text-base font-semibold">Shop Luxury Wigs</h3>
              </div>
              <p className="mt-2 text-xs text-[#1A1A1A]/65">
                Browse our premium double-drawn virgin human hair and Futura collections.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C89D34] group-hover:underline">
                Browse collection <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/contact"
              className="group flex flex-col justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-5 transition-all duration-200 hover:border-[#C89D34] hover:shadow-xs"
            >
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <HeartHandshake className="h-5 w-5 text-[#C89D34]" />
                <h3 className="font-serif text-base font-semibold">Ask a Stylist</h3>
              </div>
              <p className="mt-2 text-xs text-[#1A1A1A]/65">
                Need personalized advice on curl pattern maintenance or cap fit? Talk to our team.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C89D34] group-hover:underline">
                Contact concierge <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {/* Concierge Banner */}
          <div className="mt-12 rounded-2xl bg-[#0A0A0A] p-6 text-center text-white sm:p-10">
            <h3 className="font-serif text-2xl text-white sm:text-3xl">
              Prefer Professional Studio Maintenance?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Let our master stylists revitalize your unit with deep ozone steaming, customized lace bleaching, and precision restyling.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="https://wa.me/254792114292?text=Hello%20Dallian%20Luxe%20Hair,%20I%20would%20like%20to%20book%20a%20wig%20revamp%20and%20laundry%20service."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              >
                <MessageSquare className="h-4 w-4" />
                Book Revamp on WhatsApp
              </a>
              <a
                href={`tel:${brand.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-[#C89D34] hover:text-[#C89D34]"
              >
                <Phone className="h-4 w-4" />
                Call 0792 11 42 92
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
