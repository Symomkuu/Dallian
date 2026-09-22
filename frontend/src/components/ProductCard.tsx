'use client';

import React from 'react';
import { Link } from '@/components/RouterCompat';
import { EyeIcon, HeartIcon, ShoppingBagIcon } from 'lucide-react';
import type { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { availabilityLabel, cx, formatKsh } from '../utils/format';
import { StarRating } from './ui/StarRating';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  layout?: 'grid' | 'compact';
}

export function ProductCard({ product, onQuickView, layout = 'grid' }: ProductCardProps) {
  // Destructure setCartOpen from store alongside addToCart
  const { addToCart, setCartOpen, toggleWishlist, isWishlisted } = useStore();
  const saved = isWishlisted(product.id);
  const soldOut = product.availability === 'out-of-stock';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Add selected item to active cart state
    addToCart(product, {
      length: product.lengths[Math.floor(product.lengths.length / 2)] ?? product.lengths[0],
      color: product.colors[0]?.name ?? '',
      capType: product.capTypes[0] ?? '',
    });

    // 2. Explicitly trigger side drawer modal to open
    setCartOpen(true);
  };

  return (
    <article className="group flex h-full flex-col border border-stone-200 bg-white p-4 transition-all duration-300 hover:shadow-md">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-stone-100">
        <Link to={`/product/${product.slug}`} aria-label={product.name} className="block">
          <img
            src={product.images[0]}
            alt={`${product.name} — ${product.style} wig modelled`}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-0 top-0 flex flex-col gap-1">
          {product.badges?.includes('bestseller') && (
            <span className="bg-[#D99B26] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white">
              Best Seller
            </span>
          )}
          {product.badges?.includes('new') && (
            <span className="bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white">
              New
            </span>
          )}
          {soldOut && (
            <span className="bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-stone-700">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Icon */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-900 shadow-sm transition-colors duration-200 hover:text-[#D99B26]"
        >
          <HeartIcon width={14} height={14} className={saved ? 'fill-[#4A2820] text-[#4A2820]' : 'stroke-[1.5]'} />
        </button>

        {/* Quick View Bar on Hover */}
        {onQuickView && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="flex w-full items-center justify-center gap-2 bg-[#4A2820] py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#381e18]"
            >
              <EyeIcon width={15} height={15} />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
          {product.category === 'human-hair' ? 'Human Hair' : 'Japanese Futura'}
        </p>

        <h3 className="mt-1 font-serif text-lg font-medium leading-snug text-stone-900">
          <Link to={`/product/${product.slug}`} className="transition-colors duration-150 hover:underline">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 text-xs text-stone-500">
          {product.style} - {product.lengths[0]}"–{product.lengths[product.lengths.length - 1]}"
        </p>

        {/* Available Swatches */}
        <div className="mt-3 flex items-center gap-1.5" aria-label="Available colours">
          {product.colors.map((color) => (
            <span
              key={color.name}
              title={color.name}
              className="h-3.5 w-3.5 rounded-full border border-stone-300"
              style={{ backgroundColor: color.hex }}
            />
          ))}
          <span className="ml-1 text-[11px] text-stone-400">{product.colors.length} colours</span>
        </div>

        {/* Star Rating */}
        <div className="mt-2">
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>

        {/* Price & Stock Status */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-serif text-lg font-medium text-stone-900">
              {formatKsh(product.price)}
            </p>

            <span
              className={cx(
                'text-xs font-medium',
                product.availability === 'in-stock' && 'text-emerald-700',
                product.availability === 'low-stock' && 'text-[#B36B39]',
                soldOut && 'text-stone-400'
              )}
            >
              {availabilityLabel(product.availability)}
            </span>
          </div>

          {product.compareAtPrice && (
            <p className="mt-0.5 text-xs text-stone-400 line-through">
              {formatKsh(product.compareAtPrice)}
            </p>
          )}

          {/* Add to Cart Button */}
          {layout === 'grid' && (
            <button
              type="button"
              disabled={soldOut}
              onClick={handleAddToCart}
              className="mt-4 flex w-full items-center justify-center gap-2 border border-black bg-white py-3 text-xs font-semibold uppercase tracking-widest text-black transition-all hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-300 disabled:hover:bg-transparent"
            >
              <ShoppingBagIcon width={14} height={14} />
              {soldOut ? 'Notify Me' : 'Add To Cart'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}