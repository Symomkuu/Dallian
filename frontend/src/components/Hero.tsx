'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { imagery } from '../data/brand';
import { LinkButton } from './ui/Button';

const HERO_DESCRIPTION =
  'Discover 100% virgin human hair and Japanese Futura wigs crafted to elevate your presence with timeless poise.';

function HeroTypewriter() {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < HERO_DESCRIPTION.length) {
        timeout = setTimeout(() => {
          setDisplayText(HERO_DESCRIPTION.slice(0, displayText.length + 1));
        }, 30);
      } else {
        // Pause 4.5 seconds when full sentence has been typed
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 4500);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(HERO_DESCRIPTION.slice(0, displayText.length - 1));
        }, 15);
      } else {
        // Pause before restarting
        timeout = setTimeout(() => {
          setIsDeleting(false);
        }, 600);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  return (
    <span className="relative inline">
      <span className="sr-only">{HERO_DESCRIPTION}</span>
      <span aria-hidden="true">{displayText}</span>
      <span
        aria-hidden="true"
        className="inline-block w-[2px] h-[0.95em] ml-0.5 bg-amber-400 align-baseline animate-pulse shadow-xs"
      />
    </span>
  );
}

const heroSlides = [
  {
    src: imagery.hero,
    alt: 'Model wearing a long chestnut body wave wig from Dallian Luxe Hair Nairobi',
    position: 'object-[55%_center] md:object-[60%_center]',
  },
  {
    src: imagery.care,
    alt: 'Salon-grade luxury styling and wig care at Dallian Luxe Hair Studio',
    position: 'object-[60%_30%]',
  },
  {
    src: imagery.categoryHumanHair,
    alt: '100% Raw Virgin Human Hair Wigs with invisible HD lace frontal',
    position: 'object-center',
  },
  {
    src: imagery.categoryFutura,
    alt: 'Premium Japanese Futura heat-resistant wigs',
    position: 'object-center',
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[62vh] w-full overflow-hidden bg-black text-white sm:min-h-[66vh] lg:min-h-[72vh]"
    >
      {/* Background Image Carousel with Smooth Crossfade */}
      <div className="absolute inset-0 overflow-hidden">
        {heroSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Image
                fill
                priority={index === 0}
                sizes="100vw"
                src={slide.src}
                alt={slide.alt}
                className={`object-cover ${slide.position} transition-transform duration-[5000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Dark Gradient Overlay to ensure maximum text readability and contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/35"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative mx-auto flex min-h-[62vh] max-w-page flex-col justify-center px-5 py-12 sm:min-h-[66vh] sm:px-12 sm:py-16 lg:min-h-[72vh] lg:px-16 lg:py-20">
        <div className="max-w-xl">
          {/* Accent Gold Rule & Eyebrow */}
          <motion.div
            initial={{ opacity: 0.9, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
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
            initial={{ opacity: 1, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-3xl leading-[1.1] text-[#FAF8F5] sm:text-5xl sm:leading-[1.08] lg:text-6xl"
          >
            Luxury Hair.
            <br />
            Effortless
            <br />
            Confidence.
          </motion.h1>

          {/* Body Description with Typewriter Effect */}
          <motion.p
            initial={{ opacity: 1, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            className="mt-3 max-w-md text-sm leading-relaxed text-neutral-300 sm:mt-5 sm:text-base min-h-[3.8rem] sm:min-h-[4.2rem]"
          >
            <HeroTypewriter />
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 1, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
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

      {/* Carousel Navigation Indicator Dots */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-4 right-5 sm:bottom-6 sm:right-10 z-20 flex items-center gap-1.5 sm:gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 sm:w-8 bg-amber-400 shadow-xs'
                  : 'w-2 bg-white/40 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}