'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  SearchX as SearchXIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
} from 'lucide-react';

import { products } from '@/data/products';
import type { Product } from '@/types';
import { fetchStoreProducts, formatProductFromBackend } from '@/utils/api';
import { ProductGrid } from '@/components/ProductGrid';
import {
  ShopFilters,
  emptyFilters,
  type FilterState,
} from '@/components/ShopFilters';
import { SelectField } from '@/components/ui/SelectField';
import { Button } from '@/components/ui/Button';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Popular' },
];

// Swap these for your own hero images (place files in /public)
const heroImages = [
  '/shop-hero.jpg',
  '/shop-hero-2.jpg',
  '/shop-hero-3.jpg',
];


const SUBTITLE_TEXT =
  'Curated HD lace frontals and premium human hair extensions designed for the woman who demands excellence as a standard.';

function TypewriterText() {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < SUBTITLE_TEXT.length) {
        timeout = setTimeout(() => {
          setDisplayText(SUBTITLE_TEXT.slice(0, displayText.length + 1));
        }, 32);
      } else {
        // Finished typing: wait 3.5 seconds before typing again
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 3500);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(SUBTITLE_TEXT.slice(0, displayText.length - 1));
        }, 16);
      } else {
        // Finished clearing: brief pause before restarting
        timeout = setTimeout(() => {
          setIsDeleting(false);
        }, 500);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  return (
    <span className="relative inline">
      <span>{displayText}</span>
      <span
        aria-hidden="true"
        className="inline-block w-[2px] h-[1em] ml-0.5 bg-gold align-baseline animate-pulse shadow-sm"
      />
    </span>
  );
}

function ShopHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    // Fast carousel interval (2800ms)
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % heroImages.length);
    }, 2800);

    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative isolate flex h-[260px] items-center overflow-hidden bg-ink sm:h-[320px] lg:h-[380px]">
      {/* Carousel slides */}
      {heroImages.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover object-[70%_20%] transition-opacity duration-700 ease-in-out ${
            index === active ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Dark gradient so the copy stays readable over the photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/10 via-ink/55 to-ink/80" />

      <div className="relative mx-auto w-full max-w-page px-5 sm:px-8">
        <div className="ml-auto max-w-[85%] text-right sm:max-w-md lg:max-w-lg lg:pr-6">
          <div className="mb-2 flex items-center justify-end gap-2 sm:mb-3 sm:gap-3">
            <span className="h-px w-6 bg-gold sm:w-10" />
            <span className="text-[10px] font-medium tracking-[0.25em] text-white/85 sm:text-xs sm:tracking-[0.3em]">
              CROWN OF DISTINCTION
            </span>
          </div>

          <h1 className="font-serif text-2xl italic leading-[1.15] text-white sm:text-3xl lg:text-5xl animate-hero-land">
            The Art of Unspoken Elegance
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-white/85 sm:mt-3 sm:text-base min-h-[3.6rem] sm:min-h-[3rem]">
            <TypewriterText />
          </p>
        </div>
      </div>

      {/* Carousel dots */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-4">
          {heroImages.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === active ? 'w-6 bg-gold' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function ShopPage() {
  const searchParams = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const badge = searchParams.get('badge');

  // Interactive filter state state initialized from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    const category = searchParams.get('category');
    const style = searchParams.get('style');

    return {
      ...emptyFilters,
      categories: category ? [category] : [],
      styles: style ? [style] : [],
    };
  });

  const [sort, setSort] = useState(searchParams.get('sort') ?? 'featured');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchStoreProducts({ page_size: 100 })
      .then((res) => {
        if (!isMounted) return;
        if (res.results && res.results.length > 0) {
          setProductList(res.results.map(formatProductFromBackend));
        } else {
          setProductList(products);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load products from backend:', err);
        setProductList(products);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = productList.filter((product) => {
      if (
        filters.categories.length &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }

      if (
        filters.styles.length &&
        !filters.styles.includes(product.style)
      ) {
        return false;
      }

      if (
        filters.availability.length &&
        !filters.availability.includes(product.availability)
      ) {
        return false;
      }

      if (product.price > filters.maxPrice) {
        return false;
      }

      if (
        badge === 'featured' &&
        !product.badges?.includes('featured')
      ) {
        return false;
      }

      if (q) {
        const haystack = [
          product.name,
          product.style,
          product.shortDescription,
          product.description,
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(q)) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered];

    if (sort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    }

    if (sort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    }

    if (sort === 'newest') {
      sorted.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }

    if (sort === 'popular') {
      sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    if (sort === 'featured') {
      sorted.sort(
        (a, b) =>
          Number(b.badges?.includes('featured')) -
          Number(a.badges?.includes('featured'))
      );
    }

    return sorted;
  }, [productList, filters, sort, query, badge]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    window.history.replaceState(null, '', `?${next.toString()}`);
  };

  return (
    <>
      <ShopHero />

      <div className="mx-auto max-w-page gap-8 px-4 pb-8 sm:gap-10 sm:px-8 sm:pb-10 lg:flex lg:pb-14">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-28">
            <ShopFilters
              value={filters}
              onChange={setFilters}
              resultCount={results.length}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 py-3 lg:justify-end">
            <Button
              variant="secondary"
              size="sm"
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <SlidersHorizontalIcon width={14} height={14} />
              Filters
            </Button>

            <SelectField
              label="Sort by"
              hideLabel
              value={sort}
              options={sortOptions}
              onChange={(event) => {
                const value = event.target.value;
                setSort(value);
                updateParams({ sort: value });
              }}
              className="w-36 sm:w-44"
            />
          </div>

          {!loading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-ink/15 bg-white px-6 py-14 text-center sm:px-8 sm:py-16">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-chestnut">
                <SearchXIcon width={22} height={22} />
              </div>

              <h2 className="font-serif text-xl text-ink sm:text-2xl">
                No pieces match those filters
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
                Try widening the price range or clearing a filter. Our team can
                also recommend something close to what you have in mind.
              </p>

              <Button
                className="mt-7"
                onClick={() => {
                  setFilters(emptyFilters);
                  window.history.replaceState(null, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <ProductGrid products={results} loading={loading} />
          )}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[65] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink/55"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto bg-cream px-4 pb-6 pt-5 shadow-panel sm:px-5">
            <ShopFilters
              value={filters}
              onChange={setFilters}
              onClose={() => setDrawerOpen(false)}
              resultCount={results.length}
            />

            <Button
              size="lg"
              className="mt-2 w-full"
              onClick={() => setDrawerOpen(false)}
            >
              Show {results.length} Pieces
            </Button>
          </div>
        </div>
      )}
    </>
  );
}