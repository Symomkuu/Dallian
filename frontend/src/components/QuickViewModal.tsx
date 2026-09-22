'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/components/RouterCompat';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import type { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { formatKsh } from '../utils/format';
import { StarRating } from './ui/StarRating';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useStore();
  const [length, setLength] = useState<number | null>(null);
  const [color, setColor] = useState<string | null>(null);

  // Initialize selected values whenever product changes
  useEffect(() => {
    if (product) {
      setLength(product.lengths[2] ?? product.lengths[0] ?? null);
      setColor(product.colors[0]?.name ?? null);
    }
  }, [product]);

  // Handle ESC key press
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product) return null;

  const soldOut = product.availability === 'out-of-stock';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close quick view"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <motion.div
        role="dialog"
        aria-label={`${product.name} quick view`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="relative grid w-full max-w-3xl overflow-hidden bg-[#FAF7F2] shadow-2xl sm:grid-cols-2"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-10 p-1 text-ink/40 transition-colors hover:text-ink"
        >
          <XIcon width={18} height={18} />
        </button>

        {/* Product Image */}
        <div className="bg-[#F5EFE6]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover max-sm:aspect-[4/5]"
          />
        </div>

        {/* Details & Actions */}
        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50">
              {product.category === 'human-hair' ? 'Human Hair' : 'Japanese Futura'}
            </p>

            <h2 className="mt-1.5 font-serif text-2xl font-normal text-ink">
              {product.name}
            </h2>

            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={product.rating} count={product.reviewCount} />
            </div>

            <p className="mt-4 font-serif text-xl font-normal text-ink">
              {formatKsh(product.price)}
            </p>

            <p className="mt-3 text-xs leading-relaxed text-ink/65">
              {product.shortDescription ||
                'Glass-smooth, mirror-shine straight hair with a weightless fall.'}
            </p>

            {/* Length Options */}
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/60">
                Length
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.lengths.map((option) => {
                  const isSelected = length === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLength(option)}
                      className={`flex h-10 w-12 items-center justify-center border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-[#D99B26] bg-[#FAF7F2] text-ink font-semibold'
                          : 'border-ink/20 bg-white text-ink/70 hover:border-ink/40'
                      }`}
                    >
                      {option}"
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colour Options */}
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/60">
                Colour — <span className="uppercase text-ink">{color}</span>
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                {product.colors.map((option) => {
                  const isSelected = color === option.name;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setColor(option.name)}
                      aria-label={option.name}
                      aria-pressed={isSelected}
                      className={`h-7 w-7 rounded-full transition-all ${
                        isSelected
                          ? 'ring-2 ring-ink ring-offset-2'
                          : 'border border-ink/20 hover:scale-105'
                      }`}
                      style={{ backgroundColor: option.hex }}
                    />
                  );
                })}
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-emerald-700">In Stock</p>
          </div>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              disabled={soldOut}
              onClick={() => {
                if (length !== null && color !== null) {
                  addToCart(product, {
                    length,
                    color,
                    capType: product.capTypes?.[0] ?? 'Lace Front',
                  });
                  onClose();
                }
              }}
              className="w-full bg-black py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85 disabled:bg-ink/30"
            >
              {soldOut ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="block text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70 transition-colors hover:text-ink"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}