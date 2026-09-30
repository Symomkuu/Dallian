import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { brand } from '@/data/brand';
import { servicesData } from '@/data/services';

export const metadata: Metadata = {
  title: 'Wig Services, Styling, Laundry & Installation | Dallian Luxe Hair Nairobi',
  description:
    'Discover salon-grade wig care services at Dallian Luxe Hair Studio, Mountain Mall, Nairobi. Professional wig laundry, styling & curling, custom wig installations, and complete revamping.',
  keywords: [
    'Wig Laundry Nairobi',
    'Wig Installation Nairobi',
    'Wig Styling Mountain Mall',
    'Wig Revamping Thika Road',
    'HD Lace Melting Kenya',
    'Dallian Luxe Hair Services',
  ],
};

function ServicesHero() {
  return (
    <section className="relative isolate flex h-[260px] items-center overflow-hidden bg-ink sm:h-[320px] lg:h-[380px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/8a3f926d-4483-4271-8809-31d419bde337.jpg"
          alt="Dallian Luxe Hair Salon and Studio Services"
          fill
          priority
          className="object-cover object-[60%_30%]"
        />
      </div>

      {/* Dark gradient overlay so copy stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/30 sm:from-ink/85 sm:via-ink/50 sm:to-transparent" />

      <div className="relative mx-auto w-full max-w-page px-5 sm:px-8">
        <div className="max-w-xl text-left">
          <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
            <span className="h-px w-6 bg-gold sm:w-10" />
            <span className="text-[10px] font-medium tracking-[0.25em] text-white/90 sm:text-xs sm:tracking-[0.3em] uppercase">
              STUDIO SERVICES & CARE
            </span>
          </div>

          <h1 className="font-serif text-2xl italic leading-[1.15] text-white sm:text-3xl lg:text-5xl">
            Salon-Grade Care & Styling
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-white/85 sm:mt-3 sm:text-sm lg:text-base max-w-lg">
            Professional laundry, thermal styling, restorative revamping, and undetectable HD lace installations at Mountain Mall, Nairobi.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  const whatsappNumber = brand.phoneIntl.replace(/\D/g, '');

  return (
    <>
      <ServicesHero />

      <main className="min-h-screen bg-[#FAF7F2] pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-page px-4 sm:px-8">
          {/* SERVICES LIST SECTION */}
          <section id="services-list">
            {/* Cards Grid (2 columns on mobile and desktop) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
              {servicesData.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D99B26]/80 hover:shadow-xl sm:rounded-3xl cursor-pointer"
                >
                  {/* Image Banner */}
                  <div className="relative h-40 w-full overflow-hidden bg-ink/5 sm:h-64 lg:h-72">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    {/* Top Pricing Badge */}
                    <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4">
                      <span className="rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-ink shadow-xs sm:px-3 sm:py-1 sm:text-xs whitespace-nowrap">
                        {service.pricing}
                      </span>
                    </div>

                    {/* Bottom Image Overlay Title */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4">
                      <p className="font-serif text-sm font-normal text-white drop-shadow-md truncate sm:text-xl lg:text-2xl">
                        {service.shortTitle}
                      </p>
                      <p className="mt-0.5 hidden text-xs text-white/80 line-clamp-1 sm:block">
                        {service.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="flex flex-1 flex-col justify-between p-3 sm:p-6 lg:p-8">
                    <div>
                      <h3 className="font-serif text-sm font-normal text-ink group-hover:text-[#8B3A2A] transition-colors sm:text-xl lg:text-2xl line-clamp-1 sm:line-clamp-none">
                        {service.title}
                      </h3>

                      <p className="mt-1.5 text-[11px] leading-relaxed text-ink/75 sm:mt-3 sm:text-xs lg:text-sm line-clamp-2 sm:line-clamp-3">
                        {service.shortDescription}
                      </p>

                      {/* Highlights on tablet & desktop */}
                      <div className="hidden sm:block mt-5 space-y-2 border-t border-ink/8 pt-5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
                          Key Inclusions:
                        </p>
                        <ul className="space-y-1.5 text-xs text-ink/80">
                          {service.keyHighlights.slice(0, 3).map((highlight) => (
                            <li key={highlight} className="flex items-center gap-2">
                              <CheckCircle2 width={14} height={14} className="shrink-0 text-emerald-600" />
                              <span className="truncate">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Duration Badge */}
                      <div className="mt-2.5 sm:mt-5 flex items-center gap-1.5 text-[10px] sm:text-xs text-ink/60">
                        <Clock width={12} height={12} className="text-[#8B3A2A] shrink-0" />
                        <span className="truncate">{service.duration}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 sm:mt-7 pt-3 sm:pt-4 border-t border-ink/8">
                      <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-ink/15 bg-[#FAF7F2] px-2.5 py-2 text-[10px] font-bold tracking-wider text-ink uppercase transition duration-300 group-hover:border-[#8B3A2A] group-hover:bg-[#8B3A2A] group-hover:text-white sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-xs">
                        <span>View Details</span>
                        <ArrowRight width={12} height={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section className="mt-20 rounded-3xl border border-ink/10 bg-white p-8 shadow-sm sm:mt-28 sm:p-12 lg:p-16">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-xs">
                SEAMLESS PROCESS
              </p>
              <h2 className="mt-2 font-serif text-2xl font-normal leading-tight text-ink sm:mt-3 sm:text-4xl">
                How to Book Your Service
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-ink/70 sm:text-sm">
                We make wig maintenance effortless whether you visit us in person at Mountain Mall or arrange convenient door-to-door rider dispatch.
              </p>
            </div>

            <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              <div className="rounded-xl sm:rounded-2xl border border-ink/8 bg-[#FAF7F2] p-3.5 sm:p-6 text-center flex flex-col items-center">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#8B3A2A] text-xs sm:text-sm font-bold text-white shadow-sm">
                  1
                </span>
                <h3 className="mt-3 sm:mt-4 font-serif text-xs sm:text-base font-bold text-ink">Select & Inquire</h3>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-ink/65 leading-relaxed">
                  Choose your required service and message our studio team via WhatsApp.
                </p>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-ink/8 bg-[#FAF7F2] p-3.5 sm:p-6 text-center flex flex-col items-center">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#8B3A2A] text-xs sm:text-sm font-bold text-white shadow-sm">
                  2
                </span>
                <h3 className="mt-3 sm:mt-4 font-serif text-xs sm:text-base font-bold text-ink">Drop Off / Dispatch</h3>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-ink/65 leading-relaxed">
                  Drop off at Mountain Mall or request our dedicated rider for pickup.
                </p>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-ink/8 bg-[#FAF7F2] p-3.5 sm:p-6 text-center flex flex-col items-center">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#8B3A2A] text-xs sm:text-sm font-bold text-white shadow-sm">
                  3
                </span>
                <h3 className="mt-3 sm:mt-4 font-serif text-xs sm:text-base font-bold text-ink">Master Treatment</h3>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-ink/65 leading-relaxed">
                  Deep clarifying, fiber rejuvenation, lace prep, and precision styling.
                </p>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-ink/8 bg-[#FAF7F2] p-3.5 sm:p-6 text-center flex flex-col items-center">
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#8B3A2A] text-xs sm:text-sm font-bold text-white shadow-sm">
                  4
                </span>
                <h3 className="mt-3 sm:mt-4 font-serif text-xs sm:text-base font-bold text-ink">Pickup / Delivery</h3>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-ink/65 leading-relaxed">
                  Collect in a satin protective bag or receive fast doorstep delivery.
                </p>
              </div>
            </div>
          </section>

          {/* STUDIO VISIT CALLOUT BANNER */}
          <section className="mt-16 sm:mt-20 overflow-hidden rounded-3xl bg-ink p-8 text-white shadow-xl sm:p-12 lg:p-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D99B26]">
                  STUDIO LOCATION & APPOINTMENTS
                </span>
                <h2 className="mt-2 font-serif text-2xl font-normal leading-tight sm:text-4xl">
                  Visit Us at Mountain Mall, Nairobi
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-white/75 sm:text-sm">
                  Located on Thika Road at Mountain Mall. Enjoy personal consultations, lace color matching, custom installations, and immediate drop-off services.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <Phone width={14} height={14} className="text-[#D99B26]" />
                    <span>{brand.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock width={14} height={14} className="text-[#D99B26]" />
                    <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hi%20Dallian%20Luxe%20Hair,%20I'd%20like%20to%20schedule%20an%20appointment%20or%20drop%20off%20my%20wig.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2A] px-6 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-[#A34330]"
                >
                  <MessageCircle width={16} height={16} />
                  <span>Chat with a Stylist</span>
                </a>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur transition hover:bg-white/20"
                >
                  <span>Studio Directions</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
