'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, HelpCircle, Scissors, Layers } from 'lucide-react';
import {
  fetchStoreCategories,
  fetchStoreHairStyles,
  fetchStoreProducts,
  type StoreCategory,
  type StoreHairStyle,
} from '@/utils/api';
import { categoryMeta } from '@/data/products';

const defaultCategoryDescriptions: Record<string, { blurb: string; highlights: string[] }> = {
  'human-hair': {
    blurb: '100% authentic raw and virgin human hair pieces that can be washed, heat-styled, dyed, and customized freely with natural movement.',
    highlights: ['Cuticle Aligned Raw Strands', 'Bleach & Heat Stylable', 'Longest Lasting Durability'],
  },
  'futura': {
    blurb: 'High-grade Japanese heat-resistant synthetic fibre formulated to retain styling and curl memory after washing with effortless ease.',
    highlights: ['Heat Resistant up to 180°C', 'Superior Curl & Style Memory', 'Ready-to-Wear Everyday'],
  },
};

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
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchStoreCategories().catch(() => []),
      fetchStoreHairStyles().catch(() => []),
      fetchStoreProducts({ page_size: 100 }).catch(() => null),
    ]).then(([cats, styles, productsRes]) => {
      if (!isMounted) return;

      if (Array.isArray(cats) && cats.length > 0) {
        setCategories([...cats].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })));
      }
      if (Array.isArray(styles) && styles.length > 0) {
        setHairStyles([...styles].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })));
      }

      if (productsRes && productsRes.results) {
        const counts: Record<string, number> = {};
        productsRes.results.forEach((p) => {
          if (p.category?.slug) {
            counts[p.category.slug] = (counts[p.category.slug] || 0) + 1;
          }
          if (p.category?.name) {
            counts[p.category.name] = (counts[p.category.name] || 0) + 1;
          }
        });
        setProductCounts(counts);
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
          const defaultDesc = defaultCategoryDescriptions[cat.slug];
          const count = productCounts[cat.slug] ?? productCounts[cat.name] ?? 0;

          const blurb =
            meta?.blurb ||
            defaultDesc?.blurb ||
            `Explore our curated ${cat.name} collection, crafted with meticulous attention to detail, density, and natural finish.`;

          const highlights =
            defaultDesc?.highlights || [
              'Artisan Craftsmanship',
              'Quality Assured',
              'Comfort-Fit Construction',
            ];

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            blurb,
            highlights,
            count,
            eyebrow: `Range 0${idx + 1}`,
          };
        })
      : [
          {
            id: 1,
            name: 'Premium Human Hair',
            slug: 'human-hair',
            blurb: defaultCategoryDescriptions['human-hair'].blurb,
            highlights: defaultCategoryDescriptions['human-hair'].highlights,
            count: productCounts['human-hair'] ?? 0,
            eyebrow: 'Range 01',
          },
          {
            id: 2,
            name: 'Japanese Futura Fibre',
            slug: 'futura',
            blurb: defaultCategoryDescriptions.futura.blurb,
            highlights: defaultCategoryDescriptions.futura.highlights,
            count: productCounts.futura ?? 0,
            eyebrow: 'Range 02',
          },
        ];

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
            Every Dallian Luxe Hair piece is crafted to an uncompromising standard. Choose the range that aligns with your routine and personal aesthetic.
          </p>
        </div>

        {/* Categories Grid (2 cards per row) */}
        <section aria-label="Wig Categories" className="mt-10 sm:mt-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2">
            {displayList.map((cat) => (
              <div
                key={cat.id}
                className="group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D99B26]/80 hover:shadow-md sm:p-8"
              >
                <div>
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-2 border-b border-ink/8 pb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F2] px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#C89D34]">
                      <Layers width={12} height={12} />
                      {cat.eyebrow}
                    </span>

                    {cat.count > 0 ? (
                      <span className="text-xs font-medium text-ink/60">
                        {cat.count} {cat.count === 1 ? 'Piece' : 'Pieces'}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-ink/40">In Stock</span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="mt-5">
                    <h2 className="font-serif text-2xl font-normal text-ink group-hover:text-chestnut sm:text-3xl">
                      {cat.name}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70 sm:text-base">
                      {cat.blurb}
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  {cat.highlights && cat.highlights.length > 0 && (
                    <div className="mt-5 pt-3">
                      <ul className="space-y-2">
                        {cat.highlights.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-xs text-ink/80 sm:text-sm">
                            <Sparkles width={13} height={13} className="shrink-0 text-[#C89D34]" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-8 border-t border-ink/8 pt-5">
                  <Link
                    href={`/?category=${encodeURIComponent(cat.slug || cat.name)}`}
                    className="inline-flex w-full items-center justify-between rounded-xl bg-black px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-800 sm:px-6"
                  >
                    <span>Shop {cat.name}</span>
                    <ArrowRight width={14} height={14} className="text-[#D99B26]" />
                  </Link>
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
