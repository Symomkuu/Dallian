import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Scissors, CheckCircle2 } from 'lucide-react';

import { brand } from '@/data/brand';
import { API_BASE_URL, type StoreHairStyle } from '@/utils/api';
import { jsonLd } from '@/utils/seo';

const SITE_NAME = brand.name || 'Dallian Luxe Hair';
const SITE_URL = 'https://dallian.online';

export const metadata: Metadata = {
  title: 'Shop Wigs by Texture & Brand | Dallian Luxe Hair Nairobi',
  description:
    'Browse luxury wig textures and hair brands at Dallian Luxe Hair: Bone Straight, Body Wave, Deep Wave, Curly, Bob, and more. Same-day delivery in Nairobi, Kenya.',
  keywords: [
    'wig textures nairobi',
    'bone straight wigs kenya',
    'body wave wigs nairobi',
    'deep wave curly wigs kenya',
    'bob wigs nairobi',
    'dallian luxe hair brands',
  ],
  alternates: {
    canonical: `${SITE_URL}/brands`,
  },
  openGraph: {
    title: 'Shop Wigs by Texture & Brand | Dallian Luxe Hair Nairobi',
    description:
      'Browse luxury wig textures and hair brands at Dallian Luxe Hair: Bone Straight, Body Wave, Deep Wave, and more.',
    url: `${SITE_URL}/brands`,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/shop-hero.jpg`,
        width: 1200,
        height: 630,
        alt: 'Wig Textures and Brands Nairobi',
      },
    ],
  },
};

export const revalidate = 300;

// ==========================================
// DATA FETCHING & TYPES
// ==========================================

interface DisplayStyle {
  id: number;
  name: string;
  slug: string;
  desc?: string;
}

const fallbackStyles: DisplayStyle[] = [
  { id: 1, name: 'Bone Straight', slug: 'bone-straight', desc: 'Pin-straight strands with ultra-smooth silk finish and mirror shine.' },
  { id: 2, name: 'Body Wave', slug: 'body-wave', desc: 'Voluminous, soft S-pattern waves for effortless Hollywood glamour.' },
  { id: 3, name: 'Deep Wave', slug: 'deep-wave', desc: 'Tight, bouncy spiral curls with rich definition and natural volume.' },
  { id: 4, name: 'Bob Cut', slug: 'bob', desc: 'Chic, precision-cut silhouettes from sharp blunt cuts to asymmetrical bobs.' },
  { id: 5, name: 'Curly & Kinky', slug: 'curly', desc: 'Springy, textured ringlets that radiate natural bounce and fullness.' },
  { id: 6, name: 'Natural Straight', slug: 'straight', desc: 'Fluid movement, easy parting, and low-maintenance everyday wear.' },
];

async function getStyles(): Promise<StoreHairStyle[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/hairstyles/`, {
      next: { revalidate: 300 },
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// ==========================================
// MODULAR VIEW COMPONENTS
// ==========================================

function BrandsJsonLdScripts({
  brandsJsonLd,
  breadcrumbsJsonLd,
  faqJsonLd,
}: {
  brandsJsonLd: unknown;
  breadcrumbsJsonLd: unknown;
  faqJsonLd: unknown;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        key="brands-collection-ld"
      >
        {jsonLd(brandsJsonLd)}
      </script>
      <script
        type="application/ld+json"
        key="brands-breadcrumb-ld"
      >
        {jsonLd(breadcrumbsJsonLd)}
      </script>
      <script
        type="application/ld+json"
        key="brands-faq-ld"
      >
        {jsonLd(faqJsonLd)}
      </script>
    </>
  );
}

function BrandsHeader() {
  return (
    <div className="max-w-3xl">
      <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-xs">
        SIGNATURE TEXTURES &amp; BRANDS
      </p>
      <h1 className="mt-2.5 font-serif text-3xl font-normal leading-tight text-ink sm:mt-3.5 sm:text-5xl lg:text-6xl">
        Shop by Texture &amp; Style
      </h1>
      <p className="mt-3.5 text-sm leading-relaxed text-ink/75 sm:mt-5 sm:text-base lg:text-lg">
        Choose your desired silhouette. From mirror-finish bone straight to voluminous deep waves, each style is curated to elevate your presence.
      </p>
    </div>
  );
}

function BrandsGrid({ items }: { items: DisplayStyle[] }) {
  return (
    <section aria-label="Brands and Styles" className="mt-10 sm:mt-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/brands/${encodeURIComponent(item.slug)}`}
            className="group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#D99B26]/80 hover:shadow-md sm:p-7"
          >
            <div>
              <div className="flex items-center justify-between border-b border-ink/8 pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F2] px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#C89D34]">
                  <Scissors width={12} height={12} />
                  TEXTURE
                </span>
                <span className="text-xs font-semibold text-[#C89D34] group-hover:underline inline-flex items-center gap-1">
                  Explore Range <ArrowRight width={12} height={12} />
                </span>
              </div>

              <h2 className="mt-5 font-serif text-2xl font-normal text-ink group-hover:text-chestnut">
                {item.name}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-ink/70 sm:text-sm">
                {item.desc || `Hand-selected ${item.name.toLowerCase()} wigs and bundles with premium fullness and natural hairline.`}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-ink/8 pt-4 text-xs font-medium text-ink/75">
              <CheckCircle2 width={13} height={13} className="text-[#C89D34]" />
              <span>Available in multiple lengths (10″ – 32″)</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BrandsFaqSection() {
  return (
    <section className="mt-16 sm:mt-24">
      <div className="rounded-2xl border border-ink/10 bg-[#43231C] p-6 text-white sm:p-10 lg:p-12">
        <h2 className="font-serif text-2xl font-normal text-white sm:text-3xl">
          Frequently Asked Questions About Textures
        </h2>
        <div className="mt-6 space-y-4 text-xs leading-relaxed text-white/80 sm:text-sm">
          <div>
            <h3 className="font-semibold text-white">Can I straighten a curly or deep wave human hair wig?</h3>
            <p className="mt-1">Yes. Because our human hair is 100% authentic virgin hair, it can be straightened with a flat iron. Upon washing, the natural curl pattern returns.</p>
          </div>
          <div className="border-t border-white/10 pt-4">
            <h3 className="font-semibold text-white">Do you offer custom lace tinting and cutting at Mountain Mall?</h3>
            <p className="mt-1">Yes, our Mountain Mall studio provides full wig customisation, knot bleaching, hairline plucking, and bespoke styling.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// PAGE ROOT COMPONENT
// ==========================================

export default async function BrandsIndexPage() {
  const styles = await getStyles();
  const displayList: DisplayStyle[] = styles.length > 0 ? styles : fallbackStyles;

  const brandsJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'CollectionPage',
    name: 'Wig Textures & Brands | Dallian Luxe Hair',
    description: 'Explore signature wig textures and brand lines available at Dallian Luxe Hair Nairobi.',
    url: `${SITE_URL}/brands`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: displayList.length,
      itemListElement: displayList.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: `${SITE_URL}/brands/${encodeURIComponent(item.slug)}`,
      })),
    },
  };

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Brands & Styles',
        item: `${SITE_URL}/brands`,
      },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which wig texture requires the least daily maintenance?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bone Straight and Bob cuts are the most effortless for daily routine, needing only a light pass with a wide-tooth comb and silk serum.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I keep curly and deep wave wigs defined in Nairobi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mist with water and a leave-in conditioner, apply a lightweight curl mousse, and allow to air dry without combing while dry.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 pt-6 sm:pb-24 sm:pt-10">
      <BrandsJsonLdScripts
        brandsJsonLd={brandsJsonLd}
        breadcrumbsJsonLd={breadcrumbsJsonLd}
        faqJsonLd={faqJsonLd}
      />

      <div className="mx-auto max-w-page px-4 sm:px-8">
        <BrandsHeader />
        <BrandsGrid items={displayList} />
        <BrandsFaqSection />
      </div>
    </main>
  );
}
