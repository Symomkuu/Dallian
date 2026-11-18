import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  Sparkles,
  ChevronRight,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
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
  searchParams?: Promise<{ page?: string }>;
}

export const revalidate = 60; // categories cache
const PAGE_SIZE = 24;

// Known intentional alias clusters for user convenience & legacy marketing URLs
const ALIAS_CLUSTERS: string[][] = [
  ['vietnamese-human-hair', 'human-hair', 'vietnamese', 'vietnamese-hair', 'virgin-hair', 'raw-hair'],
  [
    'japanese-futura-unit',
    'japanese-futura-fibre',
    'futura-fibre',
    'futura-fiber',
    'japanese-futura',
    'futura',
    'synthetic',
  ],
];

// Map legacy or internal database slugs to their preferred public storefront URLs
const PREFERRED_PUBLIC_SLUGS: Record<string, string> = {
  'japanese-futura-fibre': 'japanese-futura-unit',
  'futura-fibre': 'japanese-futura-unit',
  'futura': 'japanese-futura-unit',
  'human-hair': 'vietnamese-human-hair',
};

// Fallback metadata for core brand lines to ensure official navigation never 404s
const KNOWN_CORE_CATEGORIES: Record<string, { name: string; slug: string }> = {
  'vietnamese-human-hair': { name: 'Vietnamese Human Hair', slug: 'vietnamese-human-hair' },
  'japanese-futura-unit': { name: 'Japanese Futura Unit', slug: 'japanese-futura-unit' },
  'human-hair': { name: 'Human Hair', slug: 'human-hair' },
  'futura': { name: 'Japanese Futura', slug: 'futura' },
};

// ==========================================
// DATA FETCHING HELPERS
// ==========================================

export interface CategoryProductsResult {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasError: boolean;
}

async function getCategory(slug: string): Promise<StoreCategory | null> {
  const cleanSlug = slug.toLowerCase().trim();
  const cacheOptions: RequestInit =
    process.env.NODE_ENV === 'development' ? { cache: 'no-store' } : { next: { revalidate: 60 } };

  // 1. Direct fetch using the exact requested slug first
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/categories/${encodeURIComponent(cleanSlug)}/`, cacheOptions);
    if (res.ok) return await res.json();
  } catch {}

  // 2. Fetch full categories list to check exact match or cluster aliases
  let categoryList: StoreCategory[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/categories/`, cacheOptions);
    if (res.ok) {
      categoryList = await res.json();

      // 2a. Exact match in full list
      const directMatch = categoryList.find((c) => c.slug.toLowerCase() === cleanSlug);
      if (directMatch) return directMatch;

      // 2b. Cluster alias match: if the database has another name for this range (e.g. human-hair vs vietnamese-human-hair)
      const cluster = ALIAS_CLUSTERS.find((c) => c.includes(cleanSlug));
      if (cluster) {
        const clusterMatch = categoryList.find((c) => cluster.includes(c.slug.toLowerCase()));
        if (clusterMatch) return clusterMatch;
      }
    }
  } catch {}

  // 3. Fallback for recognized brand lines: if category hasn't been created in DB yet,
  // gracefully render collection page (empty state + guide + FAQ) rather than 404
  const cluster = ALIAS_CLUSTERS.find((c) => c.includes(cleanSlug));
  const core =
    KNOWN_CORE_CATEGORIES[cleanSlug] ||
    (cluster ? KNOWN_CORE_CATEGORIES[cluster[0]] : null);

  if (core) {
    return {
      id: 0,
      name: core.name,
      slug: core.slug,
      image_url: '/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg',
      seo_name: `${core.name} Wigs Nairobi`,
      seo_description: '',
    };
  }

  return null;
}

async function fetchCategoryProductsQuery(categorySlug: string, page = 1): Promise<CategoryProductsResult> {
  const safePage = Math.max(1, page);
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/store/products/?category=${encodeURIComponent(categorySlug)}&page=${safePage}&page_size=${PAGE_SIZE}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      if (res.status === 404 && safePage > 1) {
        // Page requested is out of range
        return { products: [], totalCount: 0, currentPage: safePage, totalPages: 1, hasError: false };
      }
      return { products: [], totalCount: 0, currentPage: safePage, totalPages: 1, hasError: true };
    }

    const data = await res.json();
    const count: number =
      typeof data.count === 'number'
        ? data.count
        : Array.isArray(data)
          ? data.length
          : data.results?.length || 0;

    const results: StoreProductListItem[] = data.results || (Array.isArray(data) ? data : []);
    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

    return {
      products: results.map(formatProductFromBackend),
      totalCount: count,
      currentPage: safePage,
      totalPages,
      hasError: false,
    };
  } catch {
    return { products: [], totalCount: 0, currentPage: safePage, totalPages: 1, hasError: true };
  }
}

async function getCategoryProducts(categorySlug: string, page = 1, fallbackSlug?: string): Promise<CategoryProductsResult> {
  const primary = await fetchCategoryProductsQuery(categorySlug, page);
  if (!primary.hasError && primary.products.length === 0 && fallbackSlug && fallbackSlug !== categorySlug) {
    const fallback = await fetchCategoryProductsQuery(fallbackSlug, page);
    if (!fallback.hasError && fallback.products.length > 0) {
      return fallback;
    }
  }
  return primary;
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

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const rawParams = searchParams ? await searchParams : undefined;
  const currentPage = Math.max(1, parseInt(rawParams?.page || '1', 10) || 1);
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Category Not Found | Dallian Luxe Hair Nairobi',
      description: 'The requested wig category could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const seoContext = getCategorySeoContext(category);
  const baseDisplayName = category.seo_name?.trim() || `${category.name} Wigs & Bundles Nairobi`;
  const displayName = currentPage > 1 ? `${baseDisplayName} (Page ${currentPage})` : baseDisplayName;
  const title = `${displayName} | Dallian Luxe Hair`;

  const metaDescription =
    category.seo_description?.trim() ||
    `${seoContext.intro.slice(0, 155).trim()} Available at Dallian Luxe Hair Nairobi with same-day delivery.`;

  const cleanSlug = slug.toLowerCase().trim();
  const canonicalPublicSlug = PREFERRED_PUBLIC_SLUGS[cleanSlug] || cleanSlug;
  const canonicalUrl =
    currentPage > 1
      ? `https://dallian.online/categories/${canonicalPublicSlug}?page=${currentPage}`
      : `https://dallian.online/categories/${canonicalPublicSlug}`;
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
          url: category.image_url || 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg',
          width: 1200,
          height: 630,
          alt: `${category.name} Wigs Nairobi - Dallian Luxe Hair`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: [category.image_url || 'https://dallian.online/eefc5861-57ab-4e61-86c3-a90e1aa13f01.jpg'],
    },
  };
}

// ==========================================
// MODULAR SUB-COMPONENTS
// ==========================================

function CategoryJsonLdScripts({
  collectionJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
}: {
  collectionJsonLd: Record<string, unknown>;
  breadcrumbJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
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
        Collections &amp; Categories
      </Link>
      <ChevronRight width={12} height={12} />
      <span className="font-medium text-ink">{categoryName}</span>
    </nav>
  );
}

function CategoryHeader({
  title,
  totalCount,
  currentPage,
  pageSize,
}: {
  title: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}) {
  let countLabel = `${totalCount} ${totalCount === 1 ? 'piece' : 'pieces'} available`;
  if (totalCount > pageSize) {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    countLabel = `Showing ${start}–${end} of ${totalCount} pieces`;
  }

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
          {countLabel}
        </span>
      </div>
    </header>
  );
}

function ProductPagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination Navigation" className="mt-10 sm:mt-12 flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link
          href={`${basePath}${currentPage - 1 === 1 ? '' : `?page=${currentPage - 1}`}`}
          className="inline-flex items-center gap-1 rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-medium text-ink transition hover:bg-[#FAF7F2]"
        >
          ← Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-xl border border-ink/10 bg-white/50 px-3.5 py-2 text-xs font-medium text-ink/30 cursor-not-allowed">
          ← Previous
        </span>
      )}

      <div className="flex items-center gap-1.5">
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <Link
              key={p}
              href={`${basePath}${p === 1 ? '' : `?page=${p}`}`}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-ink text-white font-semibold'
                  : 'border border-ink/10 bg-white text-ink/80 hover:bg-[#FAF7F2]'
              }`}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="inline-flex items-center gap-1 rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-medium text-ink transition hover:bg-[#FAF7F2]"
        >
          Next →
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-xl border border-ink/10 bg-white/50 px-3.5 py-2 text-xs font-medium text-ink/30 cursor-not-allowed">
          Next →
        </span>
      )}
    </nav>
  );
}

function CategoryProductsSection({
  products,
  categoryName,
  hasError,
  currentPage,
  totalPages,
  basePath,
}: {
  products: Product[];
  categoryName: string;
  hasError: boolean;
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (hasError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-8 text-center sm:p-12">
        <AlertCircle width={32} height={32} className="mx-auto text-amber-800" />
        <h3 className="mt-3 font-serif text-xl font-normal text-ink">
          Temporarily Unable to Load Pieces
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/75">
          We experienced a connection issue loading this collection. Please refresh the page or message our studio stylists directly on WhatsApp for real-time inventory and custom orders.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${brand.phoneIntl}?text=Hello%20Dallian,%20I'm%20inquiring%20about%20the%20${encodeURIComponent(categoryName)}%20collection`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#20ba59]"
          >
            WhatsApp Stylist
          </a>
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
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
      />
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
          {seoContext.highlights.map((highlight) => (
            <span
              key={highlight}
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
        Shop by Texture &amp; Style
      </h2>
      <p className="mt-1 text-xs text-ink/60">
        Choose your preferred lace coverage and hair texture.
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {styles.map((style) => (
          <Link
            key={style.id}
            href={`/brands/${style.slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-xs font-medium text-ink transition hover:border-[#C89D34] hover:bg-white/80"
          >
            <span>{style.name}</span>
            <ChevronRight width={12} height={12} className="text-ink/40" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategoryRelatedLinks({ categories }: { categories: StoreCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <h2 className="font-serif text-lg font-normal text-ink sm:text-xl">
        Explore Other Collections
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group flex items-center justify-between rounded-xl border border-ink/10 bg-white p-4 transition hover:border-[#C89D34] hover:shadow-xs"
          >
            <div>
              <p className="font-serif text-sm font-normal text-ink group-hover:text-[#C89D34] transition-colors">
                {cat.name}
              </p>
              <p className="text-[11px] text-ink/50">View all pieces →</p>
            </div>
            <ChevronRight width={14} height={14} className="text-ink/30 group-hover:text-[#C89D34] group-hover:translate-x-0.5 transition-all" />
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
  if (faqs.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <div className="rounded-2xl border border-ink/20 bg-[#121212] p-6 text-white shadow-md sm:p-8 lg:p-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#D4AF37] sm:text-xs">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h2 className="mt-2 font-serif text-xl font-normal text-white sm:text-2xl">
            {categoryName} Questions &amp; Answers
          </h2>
          <p className="mt-1 text-xs text-white/70 sm:text-sm">
            What shoppers ask before buying {categoryName} wigs in Kenya.
          </p>
        </div>

        <div className="mt-6 space-y-5 divide-y divide-white/10">
          {faqs.map((faq, index) => (
            <div key={faq.question} className={index > 0 ? 'pt-5' : ''}>
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

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const rawParams = searchParams ? await searchParams : undefined;
  const currentPage = Math.max(1, parseInt(rawParams?.page || '1', 10) || 1);
  const cleanSlug = slug.toLowerCase().trim();

  // 1. If accessed via an old/legacy slug (e.g. /categories/japanese-futura-fibre),
  // seamlessly redirect to the preferred official URL (/categories/japanese-futura-unit)
  const canonicalRedirect = PREFERRED_PUBLIC_SLUGS[cleanSlug];
  if (canonicalRedirect && cleanSlug !== canonicalRedirect) {
    redirect(`/categories/${canonicalRedirect}`);
  }

  const category = await getCategory(cleanSlug);

  if (!category) {
    notFound();
  }

  // 2. Determine preferred public route for this category
  const targetPublicSlug = PREFERRED_PUBLIC_SLUGS[category.slug.toLowerCase()] || category.slug.toLowerCase();

  // If accessed via an unmapped alias, redirect to the preferred public slug
  if (cleanSlug !== targetPublicSlug && cleanSlug !== category.slug.toLowerCase() && category.id !== 0) {
    redirect(`/categories/${targetPublicSlug}`);
  }

  const [productsResult, allCategories, allStyles] = await Promise.all([
    getCategoryProducts(category.slug, currentPage, cleanSlug),
    getAllCategories(),
    getAllStyles(),
  ]);

  const seoContext = getCategorySeoContext(category);
  const basePath = `/categories/${targetPublicSlug}`;
  const canonicalUrl =
    currentPage > 1
      ? `https://dallian.online/categories/${targetPublicSlug}?page=${currentPage}`
      : `https://dallian.online/categories/${targetPublicSlug}`;

  const collectionJsonLd = buildCategoryJsonLd(category, productsResult.products, canonicalUrl);
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
          totalCount={productsResult.totalCount}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
        />

        <CategoryProductsSection
          products={productsResult.products}
          categoryName={category.name}
          hasError={productsResult.hasError}
          currentPage={currentPage}
          totalPages={productsResult.totalPages}
          basePath={basePath}
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
