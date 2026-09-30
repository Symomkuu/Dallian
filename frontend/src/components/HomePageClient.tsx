'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight as ArrowRightIcon,
  Clock as ClockIcon,
  Info as InfoIcon,
  MapPin as MapPinIcon,
  X as XIcon,
} from 'lucide-react';

import { brand, imagery } from '@/data/brand';
import { categoryMeta } from '@/data/products';
import type { Product } from '@/types';
import { reviews } from '@/data/content';
import {
  fetchStoreFeaturedProducts,
  formatProductFromBackend,
} from '@/utils/api';

import { Hero } from '@/components/Hero';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductGrid } from '@/components/ProductGrid';
import { SectionHeading } from '@/components/SectionHeading';
import { ReviewCard } from '@/components/ReviewCard';
import { LinkButton } from '@/components/ui/Button';
import { toast as sonnerToast } from 'sonner';

interface ToastState {
  title: string;
  action: 'added' | 'removed';
}

export function HomePageClient() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [email, setEmail] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchStoreFeaturedProducts()
      .then((res) => {
        if (!isMounted) return;
        if (res.results && Array.isArray(res.results)) {
          setFeaturedProducts(res.results.map(formatProductFromBackend));
        } else {
          setFeaturedProducts([]);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const errMsg = err instanceof Error ? err.message : 'Unable to connect to the store.';
        sonnerToast.error('Could not load featured collection', {
          description: errMsg,
        });
        setFeaturedProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoadingFeatured(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const published = reviews
    .filter((r) => r.status === 'published')
    .slice(0, 3);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setToast({ title: 'Thank you for subscribing!', action: 'added' });
    setEmail('');
  };

  return (
    <>
      <Hero />

      {/* SHOP BY CATEGORY SECTION */}
      <section
        aria-labelledby="categories-heading"
        className="w-full bg-[#FAF7F2] py-10 sm:py-16 lg:py-16"
      >
        <div className="mx-auto max-w-page px-4 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-[11px]">
              Shop by Category
            </p>
            <h2
              id="categories-heading"
              className="mt-2 font-serif text-2xl font-normal leading-tight text-ink sm:mt-3 sm:text-4xl lg:text-5xl"
            >
              Two ranges, one standard of finish
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70 sm:mt-4 sm:text-base">
              Choose the range that suits how you wear your hair — real human hair you can style freely, or Japanese Futura fibre that holds its shape with almost no effort.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6">
            <CategoryCard
              eyebrow="Range 01"
              title={categoryMeta.futura.label}
              body={categoryMeta.futura.blurb}
              cta={categoryMeta.futura.cta}
              to="/shop?category=futura"
              image={categoryMeta.futura.image}
            />

            <CategoryCard
              eyebrow="Range 02"
              title="Premium Human Hair"
              body={categoryMeta['human-hair'].blurb}
              cta={categoryMeta['human-hair'].cta}
              to="/shop?category=human-hair"
              image={categoryMeta['human-hair'].image}
            />
          </div>
        </div>
      </section>

      {/* SIGNATURE COLLECTION SECTION */}
      <section
        aria-labelledby="featured-heading"
        className="border-y border-ink/10 bg-white"
      >
        <div className="mx-auto max-w-page px-4 py-10 sm:px-8 sm:py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-[11px]">
                SIGNATURE
              </p>
              <h2
                id="featured-heading"
                className="mt-2 font-serif text-2xl font-normal leading-tight text-ink sm:mt-3 sm:text-4xl lg:text-5xl"
              >
                Shop Our Signature Collection
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border-b border-[#C89D34] pb-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-ink transition-colors duration-200 hover:text-chestnut"
            >
              View all pieces
              <ArrowRightIcon width={14} height={14} />
            </Link>
          </div>

          <div className="mt-6 sm:mt-10">
            {featuredProducts.length > 0 || loadingFeatured ? (
              <ProductGrid products={featuredProducts} columns={3} loading={loadingFeatured} />
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/15 bg-[#FAF7F2]/60 py-12 text-center">
                <p className="text-sm font-medium text-ink/60">No featured products currently listed.</p>
                <Link
                  href="/shop"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8B3A2A] hover:underline"
                >
                  Explore the full catalog →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section
        aria-labelledby="reviews-heading"
        className="bg-[#0B0B0B] py-10 sm:py-16 lg:py-24"
      >
        <div className="mx-auto max-w-page px-4 sm:px-8">
          {/* Yellow Section Label & Title */}
          <div className="mb-6 sm:mb-10">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-[11px]">
              CUSTOMER REVIEWS
            </p>
            <h2
              id="reviews-heading"
              className="mt-2 font-serif text-2xl font-normal leading-tight text-white sm:mt-3 sm:text-4xl lg:text-5xl"
            >
              In their words
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {published.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onDark
              />
            ))}
          </div>
        </div>
      </section>

      {/* STUDIO SERVICES SECTION */}
      <section
        aria-labelledby="services-heading"
        className="bg-cream"
      >
        <div className="mx-auto grid max-w-page items-center gap-6 px-4 py-10 sm:gap-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl sm:aspect-[3/2]">
            <Image
              src={imagery.care}
              alt="Dallian Luxe Hair studio services and wig care in Mountain Mall Nairobi"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <SectionHeading
              eyebrow="Studio Services"
              title="Salon-Grade Care, Styling & Revamping"
              body="Extend the life of your luxury wigs with professional studio care at Mountain Mall, Nairobi. From clarifying laundry and thermal styling to custom installations and complete revamps."
            />

            <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10 sm:mt-8">
              <li className="flex items-center justify-between py-3 text-sm text-ink/80 sm:py-3.5">
                <span className="font-medium">1. Wig Laundry & Deep Cleansing</span>
                <span className="text-xs text-[#8B3A2A] font-semibold">From KSh 1,500</span>
              </li>
              <li className="flex items-center justify-between py-3 text-sm text-ink/80 sm:py-3.5">
                <span className="font-medium">2. Styling, Curling & Silk Press</span>
                <span className="text-xs text-[#8B3A2A] font-semibold">From KSh 1,800</span>
              </li>
              <li className="flex items-center justify-between py-3 text-sm text-ink/80 sm:py-3.5">
                <span className="font-medium">3. In-Studio Wig Installation & Melt</span>
                <span className="text-xs text-[#8B3A2A] font-semibold">From KSh 2,500</span>
              </li>
              <li className="flex items-center justify-between py-3 text-sm text-ink/80 sm:py-3.5">
                <span className="font-medium">4. Wig Revamping & Reconstruction</span>
                <span className="text-xs text-[#8B3A2A] font-semibold">From KSh 2,800</span>
              </li>
            </ul>

            <LinkButton
              to="/services"
              className="mt-6 sm:mt-8"
            >
              Explore All Services
            </LinkButton>
          </div>
        </div>
      </section>

      {/* STORE SECTION */}
      <section
        aria-labelledby="store-heading"
        className="relative bg-[#110E0C] text-white overflow-hidden"
      >
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={imagery.store}
            alt="Inside the Dallian Luxe Hair store at Mountain Mall Nairobi"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-page px-5 py-12 sm:px-12 sm:py-20 lg:py-28">
          <div className="max-w-xl">
            {/* Label */}
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-[11px]">
              VISIT OUR STORE
            </p>

            {/* Heading */}
            <h2
              id="store-heading"
              className="mt-3 font-serif text-2xl font-normal text-white sm:mt-4 sm:text-4xl lg:text-5xl"
            >
              Mountain Mall, Thika Road
            </h2>

            {/* Subtitle */}
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base">
              Try pieces on, compare lengths and colours in person, and get sizing advice from our team in Nairobi.
            </p>

            {/* Address & Hours */}
            <div className="mt-6 space-y-3 text-sm text-white/90 sm:mt-8">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-1 h-4 w-4 shrink-0 text-[#C89D34]" />
                <span>Mountain Mall, Thika Road, Nairobi, Kenya</span>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-3">
                <ClockIcon className="mt-1 h-4 w-4 shrink-0 text-[#C89D34]" />
                <div className="space-y-1 text-sm text-white/80">
                  <p>Monday – Friday — 9:00 — 19:00</p>
                  <p>Saturday — 9:00 — 18:00</p>
                  <p>Sunday — 11:00 — 16:00</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-[#C89D34] px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-black transition-colors duration-200 hover:bg-[#b0872a] sm:px-7 sm:py-3.5"
              >
                CONTACT US
              </Link>

              <a
                href={`https://wa.me/${brand.phoneIntl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center border border-[#C89D34]/80 bg-black/40 px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-white backdrop-blur-sm transition-colors duration-200 hover:bg-[#C89D34] hover:text-black sm:px-7 sm:py-3.5"
              >
                WHATSAPP 0792 11 42 92
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DALLIAN CIRCLE / NEWSLETTER SECTION */}
      <section
        aria-labelledby="newsletter-heading"
        className="bg-[#50291f] px-5 py-12 text-center text-white sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-2xl">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#D8A738] sm:text-[11px]">
            DALLIAN CIRCLE
          </p>

          <h2
            id="newsletter-heading"
            className="mt-3 font-serif text-2xl font-normal sm:mt-4 sm:text-4xl lg:text-5xl"
          >
            New arrivals, first look
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base">
            Join our list for new collection drops and care tips. We only send what is worth opening.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full max-w-md border border-white/20 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/50 transition-colors focus:border-[#D8A738] focus:outline-none sm:py-3.5"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#D8A738] px-8 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-black transition-colors duration-200 hover:bg-[#c0932f] sm:py-3.5"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>

      {/* BOTTOM POPUP TOAST MODAL */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="flex items-start justify-between bg-[#0E0D0A] p-4 text-white shadow-2xl border border-[#C89D34]/20">
            <div className="flex items-start gap-3">
              <InfoIcon className="h-5 w-5 text-[#C89D34] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white leading-none">
                  {toast.action === 'added'
                    ? 'Added to wishlist.'
                    : 'Removed from wishlist.'}
                </p>
                <p className="mt-1.5 text-xs text-gray-400">{toast.title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
