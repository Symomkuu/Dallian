'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search as SearchIcon,
  X as XIcon,
} from 'lucide-react';

import { products } from '../data/product';
import { formatKsh } from '../utils/format';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery('');

      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    }
  }, [open]);

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

    return products
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
  }, [query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-label="Search products"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.22,
          ease: [0.23, 1, 0.32, 1],
        }}
        className="relative mx-auto w-full max-w-3xl bg-cream px-5 py-6 shadow-panel sm:px-8 sm:py-8"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();

            router.push(
              `/shop?q=${encodeURIComponent(query)}`
            );

            onClose();
          }}
          className="flex items-center gap-3 border-b border-ink/20 pb-4"
        >
          <SearchIcon
            width={18}
            height={18}
            className="text-chestnut"
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
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search by style, texture, colour or name"
            className="flex-1 bg-transparent font-serif text-lg text-ink placeholder:text-ink/35 focus:outline-none sm:text-2xl"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-ink/50 hover:text-ink"
          >
            <XIcon width={20} height={20} />
          </button>
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
                  className="rounded-sm border border-ink/15 bg-white px-3 py-2 text-xs text-ink/70 transition-colors duration-200 hover:border-gold hover:text-ink"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {query && results.length === 0 && (
          <p className="mt-8 text-sm text-ink/60">
            No pieces match “{query}”. Try a texture such as{' '}
            <em>body wave</em>, or contact us for help.
          </p>
        )}

        {results.length > 0 && (
          <ul className="mt-5 divide-y divide-ink/10">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 py-3 transition-colors duration-150 hover:bg-white"
                >
                  <img
                    src={product.images[0]}
                    alt=""
                    className="h-16 w-14 object-cover"
                    loading="lazy"
                  />

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

                  <span className="text-sm text-ink/70">
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