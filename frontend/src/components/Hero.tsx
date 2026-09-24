import React from 'react';
import { imagery } from '../data/brand';
import { LinkButton } from './ui/Button';

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative min-h-[60vh] w-full overflow-hidden bg-black text-white sm:min-h-[65vh] lg:min-h-[68vh]">
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
      <div className="relative mx-auto flex min-h-[60vh] max-w-page flex-col justify-center px-5 py-12 sm:min-h-[65vh] sm:px-12 sm:py-16 lg:min-h-[68vh] lg:px-16 lg:py-20">
        <div className="max-w-xl">
          {/* Subtle Accent Gold Rule */}
          <div className="mb-4 h-[1px] w-10 bg-amber-400/70 sm:mb-6 sm:w-12" />

          {/* Subtitle / Brand Label */}
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-amber-300/90 sm:text-[11px] sm:tracking-[0.25em]">
            Dallian Luxe Hair
          </p>

          {/* Heading */}
          <h1
            id="hero-heading"
            className="mt-3 font-serif text-3xl leading-[1.1] text-[#FAF8F5] sm:mt-4 sm:text-5xl sm:leading-[1.08] lg:text-6xl"
          >
            Luxury Hair.
            <br />
            Effortless
            <br />
            Confidence.
          </h1>

          {/* Body Description */}
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-300 sm:mt-5 sm:text-base">
            Discover premium human hair and Japanese Futura fibre wigs designed to elevate your look.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
            <LinkButton to="/" variant="gold" size="lg">
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