'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  SearchX as SearchXIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
} from 'lucide-react';

import { products } from '@/data/products';
import { PageHeader } from '@/components/PageHeader';
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

function matchesLength(lengths: number[], buckets: string[]): boolean {
  if (buckets.length === 0) return true;

  return buckets.some((bucket) => {
    if (bucket.startsWith('Short')) {
      return Math.min(...lengths) <= 14;
    }

    if (bucket.startsWith('Mid')) {
      return lengths.some((l) => l >= 16 && l <= 22);
    }

    return Math.max(...lengths) >= 24;
  });
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
  const [loading, setLoading] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
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

      if (!matchesLength(product.lengths, filters.lengths)) {
        return false;
      }

      if (
        filters.colors.length &&
        !product.colors.some((color) => filters.colors.includes(color.name))
      ) {
        return false;
      }

      if (
        filters.availability.length &&
        !filters.availability.includes(product.availability)
      ) {
        return false;
      }

      if (
        filters.laceTypes.length &&
        !product.laceTypes.some((lace) => filters.laceTypes.includes(lace))
      ) {
        return false;
      }

      if (
        filters.capTypes.length &&
        !product.capTypes.some((cap) => filters.capTypes.includes(cap))
      ) {
        return false;
      }

      if (product.price > filters.maxPrice) {
        return false;
      }

      if (
        badge === 'featured' &&
        !product.badges.includes('featured')
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
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    if (sort === 'popular') {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }

    if (sort === 'featured') {
      sorted.sort(
        (a, b) =>
          Number(b.badges.includes('featured')) -
          Number(a.badges.includes('featured'))
      );
    }

    return sorted;
  }, [filters, sort, query, badge]);

  const activeCategory =
    filters.categories.length === 1 ? filters.categories[0] : null;

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
      <PageHeader
        eyebrow="Collection"
        title={
          activeCategory === 'human-hair'
            ? 'Premium Human Hair'
            : activeCategory === 'futura'
            ? 'Japanese Futura Fibre'
            : 'Shop All Wigs'
        }
        body={
          query
            ? `Showing results for “${query}”.`
            : 'Filter by style, length, colour, lace and cap to find the piece that fits how you wear your hair.'
        }
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Shop' },
        ]}
      />

      <div className="mx-auto max-w-page gap-10 px-5 py-10 sm:px-8 lg:flex lg:py-14">
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
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-ink/10 pb-5">
            <p className="text-sm text-ink/60">
              {loading
                ? 'Loading pieces…'
                : `${results.length} ${
                    results.length === 1 ? 'piece' : 'pieces'
                  }`}
            </p>

            <div className="flex items-center gap-3">
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
                className="w-44"
              />
            </div>
          </div>

          {!loading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-ink/15 bg-white px-8 py-16 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-chestnut">
                <SearchXIcon width={22} height={22} />
              </div>

              <h2 className="font-serif text-2xl text-ink">
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
                  window.history.replaceState(null, '', '/shop');
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

          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-hidden bg-cream px-5 pb-6 pt-5 shadow-panel">
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