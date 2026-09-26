'use client';

import React, { useEffect, useState } from 'react';
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
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0]?.name ?? '');
  const [displayedImage, setDisplayedImage] = useState<string>(
    product.colors?.[0]?.image || product.images?.[0] || '/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg'
  );

  useEffect(() => {
    const col = product.colors?.find((c) => c.name === selectedColor) || product.colors?.[0];
    if (col?.image) {
      setDisplayedImage(col.image);
    } else {
      setDisplayedImage(product.images?.[0] || '/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg');
    }
  }, [product, selectedColor]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.sizes?.[0];
    const activeColorObj = product.colors?.find((c) => c.name === selectedColor) || product.colors?.[0];
    const defaultLength = product.lengths?.[0];

    addToCart(product, {
      size: defaultSize?.name,
      length: defaultLength,
      color: activeColorObj?.name,
      capType: product.capTypes?.[0],
      price:
        defaultSize?.price != null
          ? defaultSize.price
          : activeColorObj?.price != null
            ? activeColorObj.price
            : product.price,
    });

    // 2. Explicitly trigger side drawer modal to open
    setCartOpen(true);
  };

  return (
    <article className="group flex h-full flex-col border border-stone-200 bg-white p-2.5 sm:p-4 transition-all duration-300 hover:shadow-md">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-stone-100">
        <Link to={`/product/${product.slug}`} aria-label={product.name} className="block">
          <img
            src={displayedImage}
            alt={`${product.name} — ${product.style || ''} wig modelled`}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-0 top-0 flex flex-col gap-1">
          {product.badges?.includes('bestseller') && (
            <span className="bg-[#D99B26] px-1.5 py-0.5 sm:px-3 sm:py-1.5 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider sm:tracking-widest text-white">
              Best Seller
            </span>
          )}
          {product.badges?.includes('new') && (
            <span className="bg-black px-1.5 py-0.5 sm:px-3 sm:py-1.5 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider sm:tracking-widest text-white">
              New
            </span>
          )}
          {soldOut && (
            <span className="bg-white/90 px-1.5 py-0.5 sm:px-3 sm:py-1.5 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider sm:tracking-widest text-stone-700">
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
          className="absolute right-2 top-2 sm:right-3 sm:top-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-stone-900 shadow-sm transition-colors duration-200 hover:text-[#D99B26]"
        >
          <HeartIcon width={13} height={13} className={saved ? 'fill-[#4A2820] text-[#4A2820]' : 'stroke-[1.5]'} />
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
      <div className="flex flex-1 flex-col pt-3 sm:pt-4">
        {product.category && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            {product.category}
          </p>
        )}

        <h3 className="mt-1 font-serif text-sm sm:text-lg font-medium leading-snug text-stone-900 line-clamp-2">
          <Link to={`/product/${product.slug}`} className="transition-colors duration-150 hover:underline">
            {product.name}
          </Link>
        </h3>

        {(product.style || (product.sizes && product.sizes.length > 0)) && (
          <p className="mt-1 text-xs text-stone-500">
            {product.style || ''}
            {product.sizes && product.sizes.length > 0
              ? `${product.style ? ' · ' : ''}${product.sizes.map((s) => s.name).join(', ')}`
              : ''}
          </p>
        )}

        {/* Available Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5" aria-label="Available colours">
            {product.colors.map((color) => {
              const isSelected = selectedColor === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(color.name);
                    if (color.image) {
                      setDisplayedImage(color.image);
                    }
                  }}
                  onMouseEnter={() => {
                    if (color.image) {
                      setDisplayedImage(color.image);
                    }
                  }}
                  className={cx(
                    'h-4 w-4 rounded-full border transition-all duration-150',
                    isSelected
                      ? 'border-[#4A2820] ring-1 ring-[#4A2820] scale-110'
                      : 'border-stone-300 hover:scale-105'
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
            <span className="ml-1 text-[11px] text-stone-400">
              {product.colors.length} {product.colors.length === 1 ? 'colour' : 'colours'}
            </span>
          </div>
        )}

        {/* Star Rating */}
        <div className="mt-2">
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>

        {/* Price & Stock Status */}
        <div className="mt-auto pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2">
            <p className="font-serif text-sm sm:text-lg font-medium text-stone-900">
              {formatKsh(product.price)}
            </p>

            <span
              className={cx(
                'text-[10px] sm:text-xs font-medium',
                product.availability === 'in-stock' && 'text-emerald-700',
                product.availability === 'low-stock' && 'text-[#B36B39]',
                soldOut && 'text-stone-400'
              )}
            >
              {availabilityLabel(product.availability)}
            </span>
          </div>

          {product.compareAtPrice && (
            <p className="mt-0.5 text-[10px] sm:text-xs text-stone-400 line-through">
              {formatKsh(product.compareAtPrice)}
            </p>
          )}

          {/* Add to Cart Button */}
          {layout === 'grid' && (
            <button
              type="button"
              disabled={soldOut}
              onClick={handleAddToCart}
              className="mt-3 sm:mt-4 flex w-full items-center justify-center gap-1.5 sm:gap-2 border border-black bg-white py-2 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest text-black transition-all hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-300 disabled:hover:bg-transparent"
            >
              <ShoppingBagIcon width={13} height={13} className="shrink-0" />
              <span>{soldOut ? 'Notify Me' : 'Add To Cart'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}