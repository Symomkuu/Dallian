'use client';

import React, { useState } from 'react';
import { MapPinIcon } from 'lucide-react';
import Image from 'next/image';
import { brand, imagery } from '@/data/brand';
import { SectionHeading } from '@/components/SectionHeading';
import { LinkButton } from '@/components/ui/Button';

export default function AboutPage() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: wire up to your subscribe endpoint
    setEmail('');
  };

  return (
    <>

      <section aria-labelledby="story-heading" className="mx-auto max-w-page px-4 py-10 sm:px-8 sm:py-14 lg:py-20">
        <div className="grid items-center gap-6 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[16/11] overflow-hidden sm:aspect-[4/3]">
            <Image
              src={imagery.aboutStory}
              alt="A stylist preparing a premium wig in the Dallian Luxe Hair store"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <SectionHeading
              eyebrow="Our Story"
              title="Built on careful selection, not volume"
              body="We started Dallian Luxe Hair because finding a genuinely good wig should not be a gamble. Every piece in the collection is chosen by our team, and every customer is guided on length, texture and fit rather than left to guess."
            />

            <p className="mt-4 text-sm leading-relaxed text-ink/65 sm:mt-5">
              Our tagline — {brand.tagline} — is how we work. We would rather help you choose one piece you love and wear often than sell you something that sits in a box.
            </p>
          </div>
        </div>
      </section>


      <section aria-labelledby="visit-heading" className="relative overflow-hidden bg-ink">
  <Image
    src={imagery.store}
    alt=""
    fill
    className="object-cover"
  />
  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" aria-hidden="true" />

  <div className="relative mx-auto max-w-page px-4 py-14 sm:px-8 sm:py-20 lg:py-28">
    <div className="max-w-xl">
      <p className="label-luxe text-white">Find Us</p>
      <h2 id="visit-heading" className="mt-3 font-serif text-2xl leading-tight text-white sm:mt-4 sm:text-3xl lg:text-4xl">
        Our store in Nairobi
      </h2>
      <p className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-white sm:mt-5">
        <MapPinIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold" />
        {brand.addressLine1}, {brand.addressLine2}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-white sm:mt-4">
        Come in to compare textures and lengths in person, or talk to us before you order online — we are happy to advise.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 sm:mt-9">
        <LinkButton to="/contact" variant="gold">
          Contact Us
        </LinkButton>
        <LinkButton to="/" variant="onDark">
          Shop the Collection
        </LinkButton>
      </div>
    </div>
  </div>
</section>
      {/* DALLIAN CIRCLE / NEWSLETTER SECTION — matches the homepage */}
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
    </>
  );
}