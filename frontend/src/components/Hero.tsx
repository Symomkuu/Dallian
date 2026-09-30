'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { imagery } from '../data/brand';
import { LinkButton } from './ui/Button';

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[62vh] w-full overflow-hidden bg-black text-white sm:min-h-[66vh] lg:min-h-[72vh]"
    >
      {/* Hero Model Image with Luxury Entrance */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <Image
          fill
          priority
          sizes="100vw"
          src={imagery.hero}
          alt="Model wearing a long chestnut body wave wig from Dallian Luxe Hair Nairobi"
          className="object-cover object-[55%_center] md:object-[60%_center]"
        />
      </motion.div>

      {/* Dark Gradient Overlay to ensure maximum text readability and contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30"
        aria-hidden="true"
      />

      {/* Content Container with Staggered Entrance */}
      <div className="relative mx-auto flex min-h-[62vh] max-w-page flex-col justify-center px-5 py-12 sm:min-h-[66vh] sm:px-12 sm:py-16 lg:min-h-[72vh] lg:px-16 lg:py-20">
        <div className="max-w-xl">
          {/* Accent Gold Rule & Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="flex items-center gap-3 mb-4 sm:mb-6"
          >
            <span className="h-px w-10 bg-amber-400/80 sm:w-12" />
            <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-amber-300/95 sm:text-[11px] sm:tracking-[0.3em]">
              Dallian Luxe Hair
            </p>
          </motion.div>

          {/* Heading with Serif Fluid Entrance */}
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-3xl leading-[1.1] text-[#FAF8F5] sm:text-5xl sm:leading-[1.08] lg:text-6xl"
          >
            Luxury Hair.
            <br />
            Effortless
            <br />
            Confidence.
          </motion.h1>

          {/* Body Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="mt-3 max-w-md text-sm leading-relaxed text-neutral-300 sm:mt-5 sm:text-base"
          >
            Discover 100% virgin human hair and Japanese Futura fibre wigs crafted to elevate your presence with timeless poise.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: 'easeOut' }}
            className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4"
          >
            <LinkButton to="/shop" variant="gold" size="lg" className="shadow-lg hover:shadow-amber-400/20">
              Shop Wigs
            </LinkButton>
            <LinkButton to="/categories" variant="onDark" size="lg" className="backdrop-blur-sm">
              Explore Collection
            </LinkButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}