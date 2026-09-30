import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { brand } from '@/data/brand';
import { getServiceBySlug, servicesData } from '@/data/services';

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: service.title,
    description: service.seoDescription,
    keywords: [
      service.shortTitle,
      `${service.shortTitle} Nairobi`,
      `${service.shortTitle} Mountain Mall`,
      'Dallian Luxe Hair Services',
      'Wig Care Kenya',
    ],
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      images: [
        {
          url: service.image,
          width: 1200,
          height: 630,
          alt: service.title,
        },
      ],
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const whatsappNumber = brand.phoneIntl.replace(/\D/g, '');
  const otherServices = servicesData.filter((s) => s.slug !== service.slug);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16 pt-6 sm:pb-24 sm:pt-10">
      <div className="mx-auto max-w-page px-4 sm:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-ink/50 sm:mb-8">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="hover:text-ink">
            Services
          </Link>
          <span>/</span>
          <span className="font-medium text-ink truncate max-w-[200px] sm:max-w-none">
            {service.shortTitle}
          </span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8B3A2A] hover:underline"
          >
            <ArrowLeft width={14} height={14} />
            <span>All Studio Services</span>
          </Link>
        </div>

        {/* SERVICE HERO & OVERVIEW */}
        <section className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Info Column */}
            <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7 lg:p-12">
              <div>
                <div className="inline-flex items-center rounded-full bg-[#8B3A2A]/10 px-3 py-1 text-xs font-semibold tracking-wider text-[#8B3A2A] uppercase">
                  {service.eyebrow}
                </div>

                <h1 className="mt-3 font-serif text-3xl font-normal leading-tight text-ink sm:text-4xl lg:text-5xl">
                  {service.title}
                </h1>

                <p className="mt-2 text-sm font-medium text-[#C89D34] sm:text-base">
                  {service.tagline}
                </p>

                <p className="mt-4 text-xs leading-relaxed text-ink/75 sm:text-sm lg:text-base">
                  {service.fullDescription}
                </p>

                {/* Key Metrics Row */}
                <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-ink/8 bg-[#FAF7F2] p-4 sm:p-5">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-ink/45">
                      Estimated Pricing
                    </span>
                    <p className="mt-1 font-serif text-xl font-bold text-ink sm:text-2xl">
                      {service.pricing}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-ink/45">
                      Turnaround Duration
                    </span>
                    <p className="mt-1 font-serif text-xl font-bold text-ink sm:text-2xl">
                      {service.duration}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking CTA Bar */}
              <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-ink/8">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hi%20Dallian%20Luxe%20Hair,%20I%20would%20like%20to%20book%20the%20${encodeURIComponent(service.title)}%20service.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2A] px-6 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-[#A34330] sm:text-sm"
                >
                  <MessageCircle width={16} height={16} />
                  <span>Book on WhatsApp</span>
                </a>

                <a
                  href={`tel:${brand.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-5 py-3.5 text-xs font-bold tracking-wider text-ink uppercase transition hover:border-[#8B3A2A] hover:text-[#8B3A2A]"
                >
                  <Phone width={15} height={15} />
                  <span className="hidden sm:inline">Call Studio</span>
                </a>
              </div>
            </div>

            {/* Right Featured Image */}
            <div className="relative min-h-[300px] lg:col-span-5 lg:min-h-full bg-ink/5">
              <Image
                src={service.image}
                alt={service.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
            </div>
          </div>
        </section>

        {/* STEP-BY-STEP PROCESS TIMELINE */}
        <section className="mt-16 sm:mt-24">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-xs">
              STEP-BY-STEP TREATMENT
            </p>
            <h2 className="mt-2 font-serif text-2xl font-normal leading-tight text-ink sm:mt-3 sm:text-4xl">
              How We Execute This Service
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-ink/70 sm:text-sm">
              Our master stylists follow an exacting protocol designed to protect your lace foundation and prolong hair vitality.
            </p>
          </div>

          <div className="mt-6 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {service.processSteps.map((step) => (
              <div
                key={step.step}
                className="relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-ink/10 bg-white p-3.5 sm:p-7 shadow-sm transition-all hover:border-[#D99B26]/60 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-[#8B3A2A] text-[11px] sm:text-xs font-bold text-white shadow-sm">
                      0{step.step}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-ink/35">
                      Stage {step.step}
                    </span>
                  </div>

                  <h3 className="mt-3 sm:mt-5 font-serif text-xs sm:text-lg font-bold text-ink">
                    {step.title}
                  </h3>

                  <p className="mt-1.5 sm:mt-2.5 text-[10px] sm:text-xs leading-relaxed text-ink/70">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SUITABILITY & BENEFITS SECTION */}
        <section className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Suitable For */}
          <div className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-10 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <ShieldCheck width={14} height={14} />
              Recommended For
            </div>
            <h3 className="mt-4 font-serif text-xl font-normal text-ink sm:text-2xl">
              Who Should Get This Service?
            </h3>
            <ul className="mt-6 space-y-3">
              {service.suitableFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-ink/80 leading-relaxed">
                  <CheckCircle2 width={16} height={16} className="shrink-0 mt-0.5 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Benefits */}
          <div className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-10 shadow-sm">
            <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
              Key Advantages
            </div>
            <h3 className="mt-4 font-serif text-xl font-normal text-ink sm:text-2xl">
              The Dallian Advantage
            </h3>
            <ul className="mt-6 space-y-3">
              {service.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-xs sm:text-sm text-ink/80 leading-relaxed">
                  <CheckCircle2 width={16} height={16} className="shrink-0 mt-0.5 text-[#C89D34]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SERVICE SPECIFIC FAQS */}
        {service.faqs.length > 0 && (
          <section className="mt-16 sm:mt-24 rounded-3xl border border-ink/10 bg-white p-6 sm:p-10 lg:p-12 shadow-sm">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-xs">
                SERVICE FAQS
              </p>
              <h2 className="mt-2 font-serif text-2xl font-normal leading-tight text-ink sm:text-3xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="mt-8 divide-y divide-ink/8">
              {service.faqs.map((faq, index) => (
                <div key={index} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="font-serif text-base font-bold text-ink">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink/70 sm:text-sm">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPLORE OTHER SERVICES */}
        <section className="mt-20 sm:mt-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-xs">
                EXPLORE MORE
              </p>
              <h2 className="mt-2 font-serif text-2xl font-normal text-ink sm:text-3xl">
                Other Studio Services
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8B3A2A] hover:underline"
            >
              <span>View all services</span>
              <ArrowRight width={14} height={14} />
            </Link>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3">
            {otherServices.map((other) => (
              <Link
                key={other.id}
                href={`/services/${other.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-ink/10 bg-white p-3 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D99B26]/80 hover:shadow-md"
              >
                <div>
                  <div className="relative h-28 sm:h-40 w-full overflow-hidden rounded-lg sm:rounded-xl bg-ink/5">
                    <Image
                      src={other.image}
                      alt={other.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <span className="mt-2.5 sm:mt-4 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C89D34]">
                    {other.eyebrow}
                  </span>
                  <h3 className="mt-0.5 sm:mt-1 font-serif text-xs sm:text-lg font-normal text-ink group-hover:text-[#8B3A2A] transition-colors truncate">
                    {other.shortTitle}
                  </h3>
                  <p className="mt-1 text-[10px] sm:text-xs text-ink/65 line-clamp-2">
                    {other.shortDescription}
                  </p>
                </div>

                <div className="mt-3 sm:mt-5 pt-2 sm:pt-3 border-t border-ink/8 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-[#8B3A2A]">
                  <span className="truncate">{other.pricing}</span>
                  <span className="inline-flex items-center gap-0.5 sm:gap-1 group-hover:translate-x-1 transition-transform">
                    <span className="hidden sm:inline">Learn More</span>
                    <ArrowRight width={12} height={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* BOTTOM STUDIO VISIT BANNER */}
        <section className="mt-16 sm:mt-20 overflow-hidden rounded-3xl bg-ink p-8 text-white shadow-xl sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D99B26]">
                READY TO ELEVATE YOUR WIG?
              </span>
              <h2 className="mt-2 font-serif text-2xl font-normal leading-tight sm:text-4xl">
                Book Your {service.shortTitle} Session Today
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-white/75 sm:text-sm">
                Message us with your desired date and drop-off preference. Our Mountain Mall studio team is ready to deliver flawless results.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hi%20Dallian%20Luxe%20Hair,%20I'd%20like%20to%20book%20the%20${encodeURIComponent(service.title)}%20service.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2A] px-6 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-[#A34330]"
              >
                <MessageCircle width={16} height={16} />
                <span>Book on WhatsApp</span>
              </a>

              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur transition hover:bg-white/20"
              >
                <span>Back to Services</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
