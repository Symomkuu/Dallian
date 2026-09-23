import React from 'react';
import { imagery } from '../data/brand';
import { LinkButton } from './ui/Button';

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative min-h-[85vh] w-full overflow-hidden bg-black text-white">
      {/* Hero Model Image */}
      <img
        src={imagery.hero}
        alt="Model wearing a long chestnut body wave wig from Dallian Luxe Hair"
        className="absolute inset-0 h-full w-full object-cover object-[55%_center] md:object-[60%_center]"
      />

      {/* Dark Gradient Overlay to match exact screenshot dimming */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" 
        aria-hidden="true" 
      />

      {/* Content Container */}
      <div className="relative mx-auto flex min-h-[85vh] max-w-page flex-col justify-center px-6 py-20 sm:px-12 lg:px-16">
        <div className="max-w-xl">
          {/* Subtle Accent Gold Rule */}
          <div className="mb-6 h-[1px] w-12 bg-amber-400/70" />

          {/* Subtitle / Brand Label */}
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-amber-300/90">
            Dallian Luxe Hair
          </p>

          {/* Heading */}
          <h1
            id="hero-heading"
            className="mt-4 font-serif text-4xl leading-[1.08] text-[#FAF8F5] sm:text-6xl lg:text-[4.25rem]"
          >
            Luxury Hair.
            <br />
            Effortless
            <br />
            Confidence.
          </h1>

          {/* Body Description */}
          <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-300 sm:text-base">
            Discover premium human hair and Japanese Futura fibre wigs designed to elevate your look.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton to="/shop" variant="gold" size="lg">
              Shop Wigs
            </LinkButton>
            <LinkButton to="/categories" variant="onDark" size="lg">
              Explore Collection
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}