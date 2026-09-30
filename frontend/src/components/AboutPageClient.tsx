'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPinIcon, SparklesIcon, ShieldCheckIcon, HeartHandshakeIcon, TruckIcon } from 'lucide-react';
import { brand, imagery } from '@/data/brand';
import { LinkButton } from '@/components/ui/Button';
import { Link } from '@/components/RouterCompat';
import { useStore } from '@/contexts/StoreContext';

export function AboutPageClient() {
  const [email, setEmail] = useState('');
  const { pushToast } = useStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    pushToast({
      title: 'Welcome to Dallian Circle',
      body: 'Thank you for joining our exclusive list for collection drops and hair care tips.',
      tone: 'success',
    });
    setEmail('');
  };

  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="mx-auto max-w-page px-4 pt-6 sm:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink/50">
          <Link to="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-ink/80">About Us</span>
        </nav>
      </div>

      {/* Hero Story Section */}
      <section aria-labelledby="story-heading" className="mx-auto max-w-page px-4 py-8 sm:px-8 sm:py-14 lg:py-16">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ink/10 shadow-sm sm:aspect-[16/11]">
            <Image
              src={imagery.aboutStory}
              alt="Dallian Luxe Hair Master Stylist handcrafting a virgin human hair wig in Nairobi studio"
              fill
              priority
              className="object-cover"
            />
          </div>

          <div>
            <span className="label-luxe text-[#C89D34]">Our Story & Craft</span>
            <h1 id="story-heading" className="mt-3 font-serif text-3xl text-ink sm:text-4xl lg:text-5xl leading-tight">
              Built on careful selection, not volume
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink/75 sm:text-base">
              We started Dallian Luxe Hair because finding a genuinely authentic, long-lasting wig in Kenya should never be a gamble. Every unit in our collection is carefully inspected, cuticle-aligned, and pre-plucked so you step out in unmatched confidence.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/75 sm:text-base">
              Our signature philosophy — <em className="text-chestnut font-serif font-medium">{brand.tagline}</em> — guides everything we do. We would rather help you choose one exceptional piece you wear for years than sell you something that sits in a box.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <LinkButton to="/shop" variant="primary">
                Shop Wigs
              </LinkButton>
              <LinkButton to="/services" variant="secondary">
                Studio Services
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values / Why Choose Us */}
      <section aria-labelledby="values-heading" className="bg-[#FAF7F2] border-y border-ink/10 py-12 sm:py-16">
        <div className="mx-auto max-w-page px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="label-luxe text-[#C89D34]">The Dallian Standard</span>
            <h2 id="values-heading" className="mt-2 font-serif text-2xl text-ink sm:text-4xl">
              Why East Africa Chooses Dallian Luxe Hair
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-ink/65 leading-relaxed">
              We combine ethically sourced virgin human hair with artisan craftsmanship and dedicated client concierge care.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-2xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold mb-4">
                <SparklesIcon width={22} height={22} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink">100% Virgin Cuticles</h3>
              <p className="mt-2 text-xs text-ink/70 leading-relaxed">
                Double-drawn human hair bundles with intact cuticles that resist tangling, shedding, and matting over time.
              </p>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-2xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8B3A2A]/10 text-[#8B3A2A] mb-4">
                <ShieldCheckIcon width={22} height={22} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink">Ultra-Thin HD Lace</h3>
              <p className="mt-2 text-xs text-ink/70 leading-relaxed">
                Invisible Swiss HD lace that melts effortlessly into all melanin complexions for undetectable glueless wear.
              </p>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-2xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 mb-4">
                <HeartHandshakeIcon width={22} height={22} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink">Personal Concierge</h3>
              <p className="mt-2 text-xs text-ink/70 leading-relaxed">
                From bespoke density recommendations to cap sizing and aftercare advice, our team walks with you at every step.
              </p>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-2xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800 mb-4">
                <TruckIcon width={22} height={22} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink">Express Dispatch</h3>
              <p className="mt-2 text-xs text-ink/70 leading-relaxed">
                Same-day rider delivery in Nairobi and secure 24-48h courier shipping across all 47 counties in Kenya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Physical Studio Section */}
      <section aria-labelledby="visit-heading" className="relative overflow-hidden bg-ink">
        <Image
          src={imagery.store}
          alt="Dallian Luxe Hair boutique salon at Mountain Mall Nairobi"
          fill
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" aria-hidden="true" />

        <div className="relative mx-auto max-w-page px-4 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div className="max-w-xl">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#D8A738]">
              Flagship Studio
            </span>
            <h2 id="visit-heading" className="mt-2 font-serif text-2xl leading-tight text-white sm:text-4xl">
              Experience the Luxury in Person
            </h2>
            <p className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-white/90">
              <MapPinIcon width={18} height={18} className="mt-0.5 shrink-0 text-[#D8A738]" />
              <span>{brand.addressLine1}, {brand.addressLine2}</span>
            </p>
            <p className="mt-3 text-xs sm:text-sm text-white/75 leading-relaxed">
              Step into our boutique to feel raw textures, compare lengths (10&quot; to 34&quot;), try on custom cap units, or enjoy a luxury wig wash and customization service.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <LinkButton to="/contact" variant="gold">
                Get Studio Directions
              </LinkButton>
              <LinkButton to="/services" variant="onDark">
                Book Studio Services
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* DALLIAN CIRCLE / NEWSLETTER SECTION */}
      <section
        aria-labelledby="newsletter-heading"
        className="bg-[#50291f] px-5 py-12 text-center text-white sm:px-8 sm:py-20"
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
            Join our private circle for new collection drops, exclusive promotions, and hair longevity secrets.
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
    </>
  );
}
