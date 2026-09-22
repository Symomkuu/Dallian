import React from 'react';
import { imagery } from '../data/brand';
import { LinkButton } from './ui/Button';

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative bg-ink">
      <img
        src={imagery.hero}
        alt="Model wearing a long chestnut body wave wig from Dallian Luxe Hair"
        className="absolute inset-0 h-full w-full object-cover object-[65%_center] opacity-85" />
      
      <div
        className="absolute inset-0 bg-ink/70 sm:bg-ink/45"
        aria-hidden="true" />
      
      <div className="relative mx-auto flex max-w-page flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-44 lg:min-h-[86vh] lg:pb-28">
        <div className="max-w-xl">
          <div className="rule-gold mb-7 w-24" />
          <p className="label-luxe text-gold">Dallian Luxe Hair</p>
          <h1
            id="hero-heading"
            className="mt-5 font-serif text-[2.6rem] leading-[1.04] text-cream sm:text-6xl lg:text-7xl">
            
            Luxury Hair.
            <br />
            Effortless Confidence.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-cream/75 sm:text-base">
            Discover premium human hair and Japanese Futura fibre wigs designed to elevate your look.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <LinkButton to="/shop" variant="gold" size="lg">
              Shop Wigs
            </LinkButton>
            <LinkButton to="/categories" variant="onDark" size="lg">
              Explore Collection
            </LinkButton>
          </div>
        </div>
      </div>
    </section>);

}