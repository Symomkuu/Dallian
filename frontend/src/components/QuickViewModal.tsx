'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/components/RouterCompat';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import type { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { availabilityLabel, cx, formatKsh } from '../utils/format';
import { Button } from './ui/Button';
import { StarRating } from './ui/StarRating';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useStore();
  const [length, setLength] = useState<number | null>(null);
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product || length === null || color === null) return null;
  const soldOut = product.availability === 'out-of-stock';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <button type="button" aria-label="Close quick view" onClick={onClose} className="absolute inset-0 bg-ink/60" />
      <motion.div
        role="dialog"
        aria-label={`${product.name} quick view`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="relative grid w-full max-w-3xl overflow-hidden bg-cream shadow-panel sm:grid-cols-2">
        
        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover max-sm:aspect-[4/3]" />
        <div className="p-7" key={product.id}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute right-4 top-4 p-1.5 text-ink/55 hover:text-ink">
            
            <XIcon width={18} height={18} />
          </button>
          <p className="label-luxe text-ink/45">
            {product.category === 'human-hair' ? 'Human Hair' : 'Japanese Futura'}
          </p>
          <h2 className="mt-2 font-serif text-2xl text-ink">{product.name}</h2>
          <div className="mt-2.5">
            <StarRating rating={product.rating} count={product.reviewCount} />
          </div>
          <p className="mt-4 font-serif text-xl text-ink">{formatKsh(product.price)}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink/65">{product.shortDescription}</p>

          <div className="mt-5">
            <p className="label-luxe mb-2 text-ink/55">Length</p>
            <div className="flex flex-wrap gap-2">
              {product.lengths.map((option) =>
              <button
                key={option}
                type="button"
                onClick={() => setLength(option)}
                className={cx(
                  'h-9 min-w-11 border px-2 text-xs transition-colors duration-200',
                  length === option ?
                  'border-gold bg-gold/15 text-ink' :
                  'border-ink/20 text-ink/70 hover:border-ink/50'
                )}>
                
                  {option} in
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="label-luxe mb-2 text-ink/55">Colour — {color}</p>
            <div className="flex gap-2.5">
              {product.colors.map((option) =>
              <button
                key={option.name}
                type="button"
                onClick={() => setColor(option.name)}
                aria-label={option.name}
                aria-pressed={color === option.name}
                className={cx(
                  'h-8 w-8 rounded-full border-2 transition-colors duration-200',
                  color === option.name ? 'border-gold' : 'border-ink/15'
                )}
                style={{ backgroundColor: option.hex }} />

              )}
            </div>
          </div>

          <p className="mt-4 text-xs text-ink/55">{availabilityLabel(product.availability)}</p>

          <Button
            className="mt-5 w-full"
            size="lg"
            disabled={soldOut}
            onClick={() => {
              addToCart(product, { length, color, capType: product.capTypes[0] });
              onClose();
            }}>
            
            {soldOut ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            className="label-luxe mt-3 block text-center text-ink/60 underline-offset-4 hover:text-chestnut hover:underline">
            
            View Full Details
          </Link>
        </div>
      </motion.div>
    </div>);

}