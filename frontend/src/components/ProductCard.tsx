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
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const saved = isWishlisted(product.id);
  const soldOut = product.availability === 'out-of-stock';

  return (
    <article className="group flex h-full flex-col border border-ink/10 bg-white transition-[border-color,box-shadow] duration-300 hover:border-gold/60 hover:shadow-card">
      <div className="relative overflow-hidden bg-cream-deep">
        <Link to={`/product/${product.slug}`} aria-label={product.name} className="block">
          <img
            src={product.images[0]}
            alt={`${product.name} — ${product.style} wig modelled`}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:scale-[1.03]" />
          
        </Link>

        <div className="absolute left-0 top-4 flex flex-col gap-1.5">
          {product.badges.includes('new') &&
          <span className="label-luxe bg-ink px-3 py-1.5 text-cream">New</span>
          }
          {product.badges.includes('bestseller') &&
          <span className="label-luxe bg-gold px-3 py-1.5 text-ink">Best Seller</span>
          }
          {soldOut && <span className="label-luxe bg-white px-3 py-1.5 text-ink/70">Sold Out</span>}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink transition-colors duration-200 hover:bg-ink hover:text-gold">
          
          <HeartIcon width={15} height={15} className={saved ? 'fill-chestnut text-chestnut' : ''} />
        </button>

        {onQuickView &&
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-[transform,opacity] duration-300 ease-[var(--ease-luxe)] group-hover:translate-y-0 group-hover:opacity-100 max-lg:hidden">
            <button
            type="button"
            onClick={() => onQuickView(product)}
            className="label-luxe flex w-full items-center justify-center gap-2 bg-ink/92 py-3.5 text-cream backdrop-blur-sm transition-colors duration-200 hover:bg-chestnut-deep">
            
              <EyeIcon width={14} height={14} />
              Quick View
            </button>
          </div>
        }
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="label-luxe text-ink/45">
          {product.category === 'human-hair' ? 'Human Hair' : 'Japanese Futura'}
        </p>
        <h3 className="mt-2 font-serif text-xl leading-snug text-ink">
          <Link to={`/product/${product.slug}`} className="transition-colors duration-150 hover:text-chestnut">
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 text-xs text-ink/55">
          {product.style} · {product.lengths[0]} in to {product.lengths[product.lengths.length - 1]} in
        </p>

        <div className="mt-3 flex items-center gap-2" aria-label="Available colours">
          {product.colors.map((color) =>
          <span
            key={color.name}
            title={color.name}
            className="h-3.5 w-3.5 rounded-full border border-ink/15"
            style={{ backgroundColor: color.hex }} />

          )}
          <span className="text-[11px] text-ink/45">{product.colors.length} colours</span>
        </div>

        <div className="mt-3">
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-serif text-lg text-ink">{formatKsh(product.price)}</p>
            <span
              className={cx(
                'text-[11px] tracking-wide',
                product.availability === 'in-stock' && 'text-emerald-700',
                product.availability === 'low-stock' && 'text-chestnut',
                soldOut && 'text-ink/45'
              )}>
              
              {availabilityLabel(product.availability)}
            </span>
          </div>
          {product.compareAtPrice &&
          <p className="mt-1 text-xs text-ink/40 line-through">{formatKsh(product.compareAtPrice)}</p>
          }

          {layout === 'grid' &&
          <button
            type="button"
            disabled={soldOut}
            onClick={() =>
            addToCart(product, {
              length: product.lengths[Math.floor(product.lengths.length / 2)],
              color: product.colors[0].name,
              capType: product.capTypes[0]
            })
            }
            className="label-luxe mt-4 flex h-11 w-full items-center justify-center gap-2 border border-ink/25 text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:border-ink/10 disabled:text-ink/35 disabled:hover:bg-transparent">
            
              <ShoppingBagIcon width={14} height={14} />
              {soldOut ? 'Notify Me' : 'Add to Cart'}
            </button>
          }
        </div>
      </div>
    </article>);

}