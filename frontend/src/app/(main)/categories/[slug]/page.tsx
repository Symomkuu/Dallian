import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  Sparkles,
  Scissors,
  ChevronRight,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

import { brand } from '@/data/brand';
import type { Product } from '@/types';
import {
  API_BASE_URL,
  formatProductFromBackend,
  type StoreCategory,
  type StoreProductListItem,
  type StoreHairStyle,
} from '@/utils/api';
import { jsonLd } from '@/utils/seo';
import {
  getCategorySeoContext,
  getCategoryKeywords,
  buildCategoryJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  type CategorySeoContext,
} from '@/utils/categorySeo';
import { ProductGrid } from '@/components/ProductGrid';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

// ==========================================
// DATA FETCHING HELPERS
// ==========================================

async function getCategory(slug: string): Promise<StoreCategory | null> {
  const cleanSlug = slug.toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/categories/${slug}/`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return await res.json();
  } catch {}

  // Fallback: match from full category list (exact, slug containment, or alias)
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/categories/`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const list: StoreCategory[] = await res.json();
      return (
        list.find((c) => c.slug.toLowerCase() === cleanSlug) ||
        list.find((c) => c.slug.toLowerCase().includes(cleanSlug)) ||
        list.find((c) => cleanSlug.includes(c.slug.toLowerCase())) ||
        (cleanSlug.includes('human') ? list.find((c) => c.slug.toLowerCase().includes('human')) : null) ||
        (cleanSlug.includes('futura') ? list.find((c) => c.slug.toLowerCase().includes('futura')) : null) ||
        null
      );
    }
  } catch {}
  return null;
}

async function getCategoryProducts(categorySlug: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/store/products/?category=${encodeURIComponent(categorySlug)}&page_size=100`,
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

async function getAllCategories(): Promise<StoreCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/categories/`, {
      next: { revalidate: 300 },
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
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

// ==========================================
// METADATA GENERATION
// ==========================================

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Category Not Found | Dallian Luxe Hair Nairobi',
      description: 'The requested wig category could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const seoContext = getCategorySeoContext(category);
  const displayName = category.seo_name?.trim() || `${category.name} Wigs & Bundles Nairobi`;
  const title = `${displayName} | Dallian Luxe Hair`;
  const metaDescription =
    category.seo_description?.trim() ||
    `${seoContext.intro.slice(0, 155).trim()} Available at Dallian Luxe Hair Nairobi with same-day delivery.`;

  const canonicalUrl = `https://dallian.online/categories/${slug}`;
  const keywords = getCategoryKeywords(category);

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
          url: category.image_url || 'https://dallian.online/shop-hero.jpg',
          width: 1200,
          height: 630,
          alt: `${category.name} Collection Nairobi`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: [category.image_url || 'https://dallian.online/shop-hero.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// ==========================================
// MODULAR VIEW COMPONENTS
// ==========================================

function CategoryJsonLdScripts({
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
        key="category-collection-ld"
      >
        {jsonLd(collectionJsonLd)}
      </script>
      <script
        type="application/ld+json"
        key="category-breadcrumb-ld"
      >
        {jsonLd(breadcrumbJsonLd)}
      </script>
      <script
        type="application/ld+json"
        key="category-faq-ld"
      >
        {jsonLd(faqJsonLd)}
      </script>
    </>
  );
}

function CategoryBreadcrumbs({ categoryName }: { categoryName: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-ink/50 sm:mb-6">
      <Link href="/" className="hover:text-ink transition-colors">
        Home
      </Link>
      <ChevronRight width={12} height={12} />
      <Link href="/categories" className="hover:text-ink transition-colors">
        Collections & Categories
      </Link>
      <ChevronRight width={12} height={12} />
      <span className="font-medium text-ink">{categoryName}</span>
    </nav>
  );
}

function CategoryHeader({
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

function CategoryProductsSection({
  products,
  categoryName,
}: {
  products: Product[];
  categoryName: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-white p-12 text-center">
        <Sparkles width={28} height={28} className="mx-auto text-[#C89D34]" />
        <h3 className="mt-3 font-serif text-xl font-normal text-ink">New Pieces Arriving Soon</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">
          Our team is currently preparing the next batch of {categoryName} units. Contact our concierge to reserve a custom piece.
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
            Browse Other Ranges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section aria-label={`${categoryName} Products`}>
      <ProductGrid products={products} columns={4} />
    </section>
  );
}

function CategoryBuyerGuide({
  categoryName,
  description,
  seoContext,
}: {
  categoryName: string;
  description?: string;
  seoContext: CategorySeoContext;
}) {
  return (
    <section className="mt-14 sm:mt-20 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34] sm:text-xs">
          BUYER&apos;S GUIDE &amp; QUALITY STANDARDS
        </p>
        <h2 className="mt-2 font-serif text-xl font-normal text-ink sm:text-2xl">
          About Our {categoryName} Selection
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

function CategoryTextureLinks({ styles }: { styles: StoreHairStyle[] }) {
  if (styles.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <h2 className="font-serif text-lg font-normal text-ink sm:text-xl">
        Filter By Texture &amp; Style
      </h2>
      <div className="mt-3 flex flex-wrap gap-2 sm:gap-2.5">
        {styles.map((style) => (
          <Link
            key={style.id}
            href={`/brands/${style.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-[#C89D34] hover:bg-[#FAF7F2] hover:text-[#8B3A2A]"
          >
            <Scissors width={12} height={12} className="text-[#C89D34]" />
            <span>{style.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategoryRelatedLinks({ categories }: { categories: StoreCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mt-10 sm:mt-12 border-t border-ink/10 pt-8">
      <h2 className="font-serif text-lg font-normal text-ink sm:text-xl">
        People Also Browse
      </h2>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`/categories/${item.slug}`}
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-xs font-semibold text-ink shadow-2xs transition hover:-translate-y-0.5 hover:border-[#C89D34] hover:bg-[#C89D34] hover:text-black"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategoryFaqSection({
  categoryName,
  faqs,
}: {
  categoryName: string;
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
            What shoppers ask before buying {categoryName} wigs in Kenya.
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

function CategoryConciergeBanner({ categoryName }: { categoryName: string }) {
  return (
    <section className="mt-12 sm:mt-16 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h3 className="font-serif text-xl font-normal text-ink sm:text-2xl">
            Need Help Selecting Your Unit?
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-ink/70 sm:text-sm">
            Speak directly with our studio stylists at Mountain Mall, Thika Road, Nairobi. We assist with cap sizing, lace tint recommendations, and custom styling.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${brand.phoneIntl}?text=Hello%20Dallian,%20I'm%20inquiring%20about%20the%20${encodeURIComponent(categoryName)}%20collection`}
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

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  // Canonical redirect: if accessed via an alias (e.g. /categories/human-hair or /categories/futura),
  // seamlessly redirect to the exact database slug (e.g. /categories/vietnamese-human-hair)
  if (slug.toLowerCase() !== category.slug.toLowerCase()) {
    redirect(`/categories/${category.slug}`);
  }

  const [products, allCategories, allStyles] = await Promise.all([
    getCategoryProducts(category.slug),
    getAllCategories(),
    getAllStyles(),
  ]);

  const seoContext = getCategorySeoContext(category);
  const canonicalUrl = `https://dallian.online/categories/${category.slug}`;

  const collectionJsonLd = buildCategoryJsonLd(category, products, canonicalUrl);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(category.name, canonicalUrl);
  const faqJsonLd = buildFaqJsonLd(seoContext.faqs);

  const relatedCategories = allCategories.filter((c) => c.slug !== category.slug).slice(0, 6);
  const headerTitle = category.seo_name || `${category.name} Wigs`;

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 pt-5 sm:pb-24 sm:pt-8">
      {/* Search Engine Structured Schemas */}
      <CategoryJsonLdScripts
        collectionJsonLd={collectionJsonLd}
        breadcrumbJsonLd={breadcrumbJsonLd}
        faqJsonLd={faqJsonLd}
      />

      <div className="mx-auto max-w-page px-4 sm:px-8">
        <CategoryBreadcrumbs categoryName={category.name} />

        <CategoryHeader
          title={headerTitle}
          productCount={products.length}
        />

        <CategoryProductsSection
          products={products}
          categoryName={category.name}
        />

        <CategoryBuyerGuide
          categoryName={category.name}
          description={category.seo_description}
          seoContext={seoContext}
        />

        <CategoryTextureLinks styles={allStyles} />

        <CategoryRelatedLinks categories={relatedCategories} />

        <CategoryFaqSection
          categoryName={category.name}
          faqs={seoContext.faqs}
        />

        <CategoryConciergeBanner categoryName={category.name} />
      </div>
    </main>
  );
}
