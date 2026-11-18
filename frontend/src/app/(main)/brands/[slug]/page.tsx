import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  Sparkles,
  Layers,
  ChevronRight,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

import { brand } from '@/data/brand';
import type { Product } from '@/types';
import {
  API_BASE_URL,
  formatProductFromBackend,
  type StoreHairStyle,
  type StoreProductListItem,
  type StoreCategory,
} from '@/utils/api';
import { jsonLd } from '@/utils/seo';
import {
  getStyleSeoContext,
  getStyleKeywords,
  buildCategoryJsonLd,
  buildFaqJsonLd,
  type CategorySeoContext,
} from '@/utils/categorySeo';
import { ProductGrid } from '@/components/ProductGrid';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

// ==========================================
// DATA FETCHING HELPERS
// ==========================================

async function getStyle(slug: string): Promise<StoreHairStyle | null> {
  const cleanSlug = slug.toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/hairstyles/${slug}/`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return await res.json();
  } catch {}

  // Fallback: match from full list (exact or intelligent slug containment)
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/hairstyles/`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const list: StoreHairStyle[] = await res.json();
      return (
        list.find((s) => s.slug.toLowerCase() === cleanSlug) ||
        list.find((s) => s.slug.toLowerCase().includes(cleanSlug)) ||
        list.find((s) => cleanSlug.includes(s.slug.toLowerCase())) ||
        null
      );
    }
  } catch {}
  return null;
}

async function getStyleProducts(styleSlug: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/store/products/?hairstyle=${encodeURIComponent(styleSlug)}&page_size=100`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const results: StoreProductListItem[] = data.results || (Array.isArray(data) ? data : []);
    return results.map(formatProductFromBackend);
  } catch {
    return [];
  }
}

async function getAllStyles(): Promise<StoreHairStyle[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/hairstyles/`, {
      next: { revalidate: 300 },
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

async function getAllCategories(): Promise<StoreCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/categories/`, {
      next: { revalidate: 300 },
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// ==========================================
// METADATA GENERATION
// ==========================================

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const style = await getStyle(slug);

  if (!style) {
    return {
      title: 'Brand / Style Not Found | Dallian Luxe Hair Nairobi',
      description: 'The requested brand or hairstyle could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const seoContext = getStyleSeoContext(style);
  const displayName = style.seo_name?.trim() || `${style.name} Wigs & Textures Nairobi`;
  const title = `${displayName} | Dallian Luxe Hair`;
  const metaDescription =
    style.seo_description?.trim() ||
    `${seoContext.intro.slice(0, 155).trim()} Available at Dallian Luxe Hair Nairobi with same-day delivery.`;

  const canonicalUrl = `https://dallian.online/brands/${slug}`;
  const keywords = getStyleKeywords(style);

  return {
    title,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonicalUrl,
      siteName: brand.name,
      locale: 'en_KE',
      type: 'website',
      images: [
        {
          url: style.logo_url || 'https://dallian.online/shop-hero.jpg',
          width: 1200,
          height: 630,
          alt: `${style.name} Wigs Nairobi`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: [style.logo_url || 'https://dallian.online/shop-hero.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ==========================================
// MODULAR VIEW COMPONENTS
// ==========================================

function BrandJsonLdScripts({
  collectionJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
}: {
  collectionJsonLd: unknown;
  breadcrumbJsonLd: unknown;
  faqJsonLd: unknown;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        key="brand-collection-ld"
      >
        {jsonLd(collectionJsonLd)}
      </script>
      <script
        type="application/ld+json"
        key="brand-breadcrumb-ld"
      >
        {jsonLd(breadcrumbJsonLd)}
      </script>
      <script
        type="application/ld+json"
        key="brand-faq-ld"
      >
        {jsonLd(faqJsonLd)}
      </script>
    </>
  );
}

function BrandBreadcrumbs({ styleName }: { styleName: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-ink/50 sm:mb-6">
      <Link href="/" className="hover:text-ink transition-colors">
        Home
      </Link>
      <ChevronRight width={12} height={12} />
      <Link href="/brands" className="hover:text-ink transition-colors">
        Brands &amp; Styles
      </Link>
      <ChevronRight width={12} height={12} />
      <span className="font-medium text-ink">{styleName}</span>
    </nav>
  );
}

function BrandHeader({
  title,
  productCount,
}: {
  title: string;
  productCount: number;
}) {
  return (
    <header className="mb-6 border-b border-ink/8 pb-4 sm:mb-8 sm:pb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-normal leading-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <div className="mt-2 h-0.5 w-12 rounded bg-[#C89D34]" />
        </div>

        <span className="text-xs font-medium text-ink/60">
          {productCount} {productCount === 1 ? 'piece' : 'pieces'} available
        </span>
      </div>
    </header>
  );
}

function BrandProductsSection({
  products,
  styleName,
}: {
  products: Product[];
  styleName: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-white p-12 text-center">
        <Sparkles width={28} height={28} className="mx-auto text-[#C89D34]" />
        <h3 className="mt-3 font-serif text-xl font-normal text-ink">New {styleName} Units Coming Soon</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">
          We are currently crafting custom {styleName} pieces. Speak with our studio stylist to order your personalized texture and length.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-xl bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800"
          >
            Contact Concierge
          </Link>
          <Link
            href="/shop"
            className="rounded-xl border border-ink/20 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-[#FAF7F2]"
          >
            Browse All Pieces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section aria-label={`${styleName} Products`}>
      <ProductGrid products={products} columns={4} />
    </section>
  );
}

function BrandGuideSection({
  styleName,
  description,
  seoContext,
}: {
  styleName: string;
  description?: string;
  seoContext: CategorySeoContext;
}) {
  return (
    <section className="mt-14 sm:mt-20 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-xs">
          TEXTURE SPOTLIGHT &amp; MAINTENANCE
        </p>
        <h2 className="mt-2 font-serif text-xl font-normal text-ink sm:text-2xl">
          About {styleName} Wigs
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/75 sm:text-base">
          {description || seoContext.intro}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {seoContext.highlights.map((highlight, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-ink/80"
            >
              <CheckCircle2 width={13} height={13} className="text-[#C89D34]" />
              {highlight}
            </span>
          ))}
        </div>

        <div className="mt-5 border-t border-ink/8 pt-4 text-xs leading-relaxed text-ink/70 sm:text-sm">
          <p>{seoContext.careGuide}</p>
        </div>
      </div>
    </section>
  );
}

function BrandCategoryLinks({ categories }: { categories: StoreCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <h2 className="font-serif text-lg font-normal text-ink sm:text-xl">
        Browse by Hair Material &amp; Range
      </h2>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-[#C89D34] hover:bg-[#FAF7F2] hover:text-[#8B3A2A]"
          >
            <Layers width={12} height={12} className="text-[#C89D34]" />
            <span>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BrandRelatedStyles({ styles }: { styles: StoreHairStyle[] }) {
  if (styles.length === 0) return null;

  return (
    <section className="mt-10 sm:mt-12 border-t border-ink/10 pt-8">
      <h2 className="font-serif text-lg font-normal text-ink sm:text-xl">
        Explore Other Textures
      </h2>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {styles.map((item) => (
          <Link
            key={item.id}
            href={`/brands/${item.slug}`}
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-xs font-semibold text-ink shadow-2xs transition hover:-translate-y-0.5 hover:border-[#C89D34] hover:bg-[#C89D34] hover:text-black"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

function BrandFaqSection({
  styleName,
  faqs,
}: {
  styleName: string;
  faqs: Array<{ question: string; answer: string }>;
}) {
  return (
    <section className="mt-14 sm:mt-20">
      <div className="rounded-2xl border border-ink/10 bg-[#43231C] p-6 text-white sm:p-10 lg:p-12">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#D99B26] sm:text-xs">
            HELP &amp; EXPERT ADVICE
          </p>
          <h2 className="mt-2 font-serif text-2xl font-normal text-white sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-1.5 text-xs text-white/70 sm:text-sm">
            Styling tips and maintenance guidance for {styleName} wigs.
          </p>
        </div>

        <div className="mt-6 space-y-5 divide-y divide-white/10">
          {faqs.map((faq, index) => (
            <div key={index} className={index > 0 ? 'pt-5' : ''}>
              <h3 className="font-serif text-base font-normal text-white">
                {faq.question}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/80 sm:text-sm">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandConciergeBanner({ styleName }: { styleName: string }) {
  return (
    <section className="mt-12 sm:mt-16 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h3 className="font-serif text-xl font-normal text-ink sm:text-2xl">
            Custom Styling &amp; Cap Fitting in Nairobi
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-ink/70 sm:text-sm">
            Visit our Mountain Mall boutique on Thika Road or speak to our stylists for personalized density, length, and lace matching.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${brand.phoneIntl}?text=Hello%20Dallian,%20I'm%20inquiring%20about%20the%20${encodeURIComponent(styleName)}%20texture`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#20ba59]"
          >
            <span>WhatsApp Stylist</span>
          </a>
          <a
            href={`tel:${brand.phoneIntl}`}
            className="inline-flex items-center gap-2 rounded-xl border border-ink/20 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink transition hover:bg-[#FAF7F2]"
          >
            <PhoneCall width={14} height={14} />
            <span>Call Studio</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// PAGE ROOT COMPONENT
// ==========================================

export default async function BrandDetailPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const style = await getStyle(slug);

  if (!style) {
    notFound();
  }

  // Canonical redirect: if accessed via an alias, cleanly redirect to exact database slug
  if (slug.toLowerCase() !== style.slug.toLowerCase()) {
    redirect(`/brands/${style.slug}`);
  }

  const [products, allStyles, allCategories] = await Promise.all([
    getStyleProducts(style.slug),
    getAllStyles(),
    getAllCategories(),
  ]);

  const seoContext = getStyleSeoContext(style);
  const canonicalUrl = `https://dallian.online/brands/${style.slug}`;
  const styleKeywords = getStyleKeywords(style);

  const collectionJsonLd = buildCategoryJsonLd(style, products, canonicalUrl, styleKeywords);
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://dallian.online',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Brands & Styles',
        item: 'https://dallian.online/brands',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: style.name,
        item: canonicalUrl,
      },
    ],
  };
  const faqJsonLd = buildFaqJsonLd(seoContext.faqs);

  const otherStyles = allStyles.filter((s) => s.slug !== style.slug).slice(0, 8);
  const headerTitle = style.seo_name || `${style.name} Wigs`;

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 pt-5 sm:pb-24 sm:pt-8">
      {/* Search Engine Structured Schemas */}
      <BrandJsonLdScripts
        collectionJsonLd={collectionJsonLd}
        breadcrumbJsonLd={breadcrumbJsonLd}
        faqJsonLd={faqJsonLd}
      />

      <div className="mx-auto max-w-page px-4 sm:px-8">
        <BrandBreadcrumbs styleName={style.name} />

        <BrandHeader
          title={headerTitle}
          productCount={products.length}
        />

        <BrandProductsSection
          products={products}
          styleName={style.name}
        />

        <BrandGuideSection
          styleName={style.name}
          description={style.seo_description}
          seoContext={seoContext}
        />

        <BrandCategoryLinks categories={allCategories} />

        <BrandRelatedStyles styles={otherStyles} />

        <BrandFaqSection
          styleName={style.name}
          faqs={seoContext.faqs}
        />

        <BrandConciergeBanner styleName={style.name} />
      </div>
    </main>
  );
}
