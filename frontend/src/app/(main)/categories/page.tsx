'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShieldCheck, HelpCircle, Scissors } from 'lucide-react';
import {
  fetchStoreCategories,
  fetchStoreHairStyles,
  cleanImageUrl,
  type StoreCategory,
  type StoreHairStyle,
} from '@/utils/api';
import { categoryMeta } from '@/data/products';

const fallbackCategories = [
  {
    id: 1,
    name: 'Premium Human Hair',
    slug: 'human-hair',
    image_url: '/7944b14b-3fd0-4899-8dbf-c03571669315.jpg',
    blurb: '100% authentic raw and virgin human hair pieces that can be washed, heat-styled, and dyed freely with unmatched natural movement.',
    features: ['100% Cuticle Aligned', 'Bleach & Dye Friendly', 'Lifespan: 2-3+ Years', 'Customizable HD Lace'],
  },
  {
    id: 2,
    name: 'Japanese Futura Fibre',
    slug: 'futura',
    image_url: '/6cac8a29-06d2-466c-b5ea-c7d4d8d00223.jpg',
    blurb: 'High-grade heat-resistant Japanese synthetic fibre designed to hold pristine styling and curl memory with zero fuss.',
    features: ['Heat Resistant up to 180°C', 'Style & Curl Memory', 'Everyday Ready-to-Wear', 'Approachable Luxury'],
  },
];

const popularTextures = [
  { name: 'Straight', query: 'Straight', desc: 'Sleek, mirror-shine finish with fluid movement.' },
  { name: 'Body Wave', query: 'Body Wave', desc: 'Voluminous, soft S-pattern waves for timeless glamour.' },
  { name: 'Deep Wave', query: 'Deep Wave', desc: 'Tight, defined curls with rich volume and bounce.' },
  { name: 'Curly', query: 'Curly', desc: 'Springy, textured ringlets that radiate natural vibrancy.' },
  { name: 'Bob', query: 'Bob', desc: 'Chic, precision-cut silhouettes from blunt to asymmetrical.' },
  { name: 'Bone Straight', query: 'Bone Straight', desc: 'Pin-straight strands with ultra-smooth silk finish.' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [hairstyles, setHairStyles] = useState<StoreHairStyle[]>([]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchStoreCategories().catch(() => []),
      fetchStoreHairStyles().catch(() => []),
    ]).then(([cats, styles]) => {
      if (!isMounted) return;
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
      if (Array.isArray(styles) && styles.length > 0) {
        setHairStyles(styles);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayList =
    categories.length > 0
      ? categories.map((cat, idx) => {
          const meta = categoryMeta[cat.slug as keyof typeof categoryMeta];
          const fallback = fallbackCategories.find((f) => f.slug === cat.slug) || fallbackCategories[idx % fallbackCategories.length];
          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            image: cleanImageUrl(cat.image_url) || meta?.image || fallback.image_url,
            blurb: meta?.blurb || fallback.blurb,
            features: fallback.features,
            eyebrow: `Range 0${idx + 1}`,
          };
        })
      : fallbackCategories.map((cat, idx) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image_url,
          blurb: cat.blurb,
          features: cat.features,
          eyebrow: `Range 0${idx + 1}`,
        }));

  const textureList =
    hairstyles.length > 0
      ? hairstyles.map((h) => {
          const matched = popularTextures.find(
            (p) => p.name.toLowerCase() === h.name.toLowerCase() || p.query.toLowerCase() === h.slug.toLowerCase()
          );
          return {
            name: h.name,
            query: h.name,
            desc: matched?.desc || 'Hand-selected texture designed for effortless beauty and styling.',
          };
        })
      : popularTextures;

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 pt-6 sm:pb-24 sm:pt-10">
      {/* Header Container */}
      <div className="mx-auto max-w-page px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-ink/50 sm:mb-8">
          <Link href="/home" className="hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-ink">Collections & Categories</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-xs sm:tracking-[0.3em]">
            CURATED COLLECTIONS
          </p>
          <h1 className="mt-2.5 font-serif text-3xl font-normal leading-tight text-ink sm:mt-3.5 sm:text-5xl lg:text-6xl">
            Explore by Category
          </h1>
          <p className="mt-3.5 text-sm leading-relaxed text-ink/75 sm:mt-5 sm:text-base lg:text-lg">
            Every Dallian Luxe Hair piece is crafted to the highest standard of finish. Choose the range that aligns with your lifestyle — authentic human hair you can style freely, or Japanese Futura fibre that holds its look effortlessly.
          </p>
        </div>

        {/* Categories Main Grid */}
        <section aria-label="Wig Categories" className="mt-10 sm:mt-14">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-2">
            {displayList.map((cat) => (
              <div
                key={cat.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-all duration-300 hover:border-[#C89D34]/50 hover:shadow-md"
              >
                {/* Image Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 sm:aspect-[16/9]">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  
                  {/* Floating Badge */}
                  <div className="absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-[#D99B26] backdrop-blur-sm sm:left-6 sm:top-6 sm:text-xs">
                    {cat.eyebrow}
                  </div>

                  {/* Overlaid Title on Image */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                    <h2 className="font-serif text-2xl font-normal text-white sm:text-3xl lg:text-4xl">
                      {cat.name}
                    </h2>
                  </div>
                </div>

                {/* Details Body */}
                <div className="flex flex-1 flex-col justify-between p-5 sm:p-8">
                  <div>
                    <p className="text-sm leading-relaxed text-ink/70 sm:text-base">
                      {cat.blurb}
                    </p>

                    {/* Features List */}
                    {cat.features && (
                      <div className="mt-5 border-t border-ink/8 pt-5">
                        <p className="text-[11px] font-semibold tracking-wider uppercase text-ink/50">
                          Signature Characteristics
                        </p>
                        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {cat.features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-ink/80 sm:text-sm">
                              <Sparkles width={13} height={13} className="shrink-0 text-[#C89D34]" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="mt-6 border-t border-ink/8 pt-5 sm:mt-8">
                    <Link
                      href={`/?category=${encodeURIComponent(cat.slug || cat.name)}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-800 sm:w-auto"
                    >
                      <span>Shop {cat.name}</span>
                      <ArrowRight width={14} height={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Textures / Hair Styles Section */}
        <section aria-labelledby="textures-heading" className="mt-16 sm:mt-24">
          <div className="border-t border-ink/10 pt-12 sm:pt-16">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-xs">
                EXPLORE BY TEXTURE
              </p>
              <h2 id="textures-heading" className="mt-2 font-serif text-2xl font-normal text-ink sm:text-3xl lg:text-4xl">
                Find Your Signature Texture
              </h2>
              <p className="mt-2.5 text-sm text-ink/70 sm:text-base">
                Prefer a specific hair texture? Filter our entire catalog directly by wave, curl, or sleek straight patterns.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {textureList.map((tex) => (
                <Link
                  key={tex.name}
                  href={`/?style=${encodeURIComponent(tex.query)}`}
                  className="group flex flex-col justify-between rounded-xl border border-ink/10 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C89D34] hover:shadow-sm sm:p-5"
                >
                  <div>
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF7F2] text-[#8B3A2A] transition group-hover:bg-[#C89D34]/15">
                      <Scissors width={16} height={16} />
                    </div>
                    <h3 className="font-serif text-base font-medium text-ink group-hover:text-chestnut">
                      {tex.name}
                    </h3>
                    <p className="mt-1 text-[11px] leading-snug text-ink/60 line-clamp-2">
                      {tex.desc}
                    </p>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#C89D34] group-hover:underline">
                    View Pieces →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Guidance & Consultation Banner */}
        <section className="mt-16 rounded-2xl bg-[#43231C] p-6 text-white sm:mt-24 sm:p-10 lg:p-12">
          <div className="grid items-center gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#D99B26] sm:text-xs">
                EXPERT ADVISORY
              </p>
              <h2 className="mt-2 font-serif text-2xl font-normal leading-snug text-white sm:text-3xl lg:text-4xl">
                Unsure which category suits your routine?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                Whether you want effortless daily wear or maximum styling versatility, our wig care specialists and stylist concierge are here to guide your selection.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:flex-col lg:items-stretch">
              <Link
                href="/wig-care"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D99B26] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black transition hover:bg-amber-400"
              >
                <HelpCircle width={15} height={15} />
                <span>Read Wig Care Guide</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:border-[#D99B26] hover:text-[#D99B26]"
              >
                <ShieldCheck width={15} height={15} />
                <span>Contact Concierge</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
