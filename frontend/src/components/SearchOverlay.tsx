'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search as SearchIcon,
  X as XIcon,
} from 'lucide-react';

import { fetchStoreProducts, formatProductFromBackend, type StoreProductListItem } from '@/utils/api';
import { formatKsh } from '@/utils/format';
import type { Product } from '@/types';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const popular = [
  'Body Wave',
  'Bob',
  'HD Lace',
  'Curly',
  'Human Hair',
];

export function SearchOverlay({
  open,
  onClose,
}: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    }
  }, [open]);

  useEffect(() => {
    let isMounted = true;
    fetchStoreProducts({ page_size: 100 })
      .then((res) => {
        if (!isMounted) return;
        setCatalog(res.results.map((item: StoreProductListItem) => formatProductFromBackend(item)));
      })
      .catch(() => {
        if (!isMounted) return;
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return [];
    }

    return catalog
      .filter((product) =>
        [
          product.name,
          product.style,
          product.category === 'human-hair'
            ? 'human hair'
            : 'japanese futura fibre',
          product.shortDescription,
          product.description,
          ...product.colors.map((c) => c.name),
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 5);
  }, [query, catalog]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-3 sm:p-6 md:p-10 overflow-y-auto">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="fixed inset-0 bg-ink/60 transition-opacity"
      />

      {/* Close button placed outside the cream modal in the top-right corner */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close search"
        className="fixed right-4 top-4 sm:right-8 sm:top-8 z-[70] flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-all hover:bg-ink hover:text-white hover:scale-105 active:scale-95"
      >
        <XIcon width={18} height={18} />
      </button>

      <motion.div
        role="dialog"
        aria-label="Search products"
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{
          duration: 0.22,
          ease: [0.23, 1, 0.32, 1],
        }}
        className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl border border-ink/10 bg-cream px-5 py-6 shadow-2xl sm:px-8 sm:py-8"
      >
        {/* Full-width Search Input Form */}
        <form
          onSubmit={(event) => {
            event.preventDefault();

            router.push(
              `/?q=${encodeURIComponent(query)}`
            );

            onClose();
          }}
          className="relative flex w-full items-center gap-3 rounded-full border border-ink/15 bg-white px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs transition-all focus-within:border-[#8B3A2A] focus-within:ring-2 focus-within:ring-[#8B3A2A]/15"
        >
          <SearchIcon
            width={20}
            height={20}
            className="text-chestnut shrink-0"
          />

          <label
            htmlFor="site-search"
            className="sr-only"
          >
            Search wigs
          </label>

          <input
            ref={inputRef}
            id="site-search"
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search by style, texture, colour or name"
            style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
            className="flex-1 bg-transparent font-serif text-base text-ink placeholder:font-sans placeholder:text-sm placeholder:text-ink/35 border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:text-lg"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear query text"
              title="Clear text"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-ink/8 hover:text-ink"
            >
              <XIcon width={14} height={14} />
            </button>
          )}
        </form>

        {!query && (
          <div className="mt-6">
            <p className="label-luxe text-ink/45">
              Popular searches
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {popular.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs text-ink/70 transition-all duration-200 hover:border-gold hover:text-ink hover:shadow-2xs"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {query && results.length === 0 && (
          <p className="mt-8 text-sm text-ink/60">
            No pieces match &ldquo;{query}&rdquo;. Try a texture such as{' '}
            <em>body wave</em>, or contact us for help.
          </p>
        )}

        {results.length > 0 && (
          <ul className="mt-5 divide-y divide-ink/8">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-xl p-2.5 transition-colors duration-150 hover:bg-white"
                >
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-ink/8 bg-ink/5">
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>

                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-base text-ink">
                      {product.name}
                    </span>

                    <span className="block text-xs text-ink/55">
                      {product.style} ·{' '}
                      {product.category === 'human-hair'
                        ? 'Human Hair'
                        : 'Japanese Futura'}
                    </span>
                  </span>

                  <span className="text-sm font-semibold text-ink/70">
                    {formatKsh(product.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}