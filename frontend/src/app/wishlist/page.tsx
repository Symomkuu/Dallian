'use client';

import React from 'react';
import Link from 'next/link';
import { HeartIcon, XIcon } from 'lucide-react';
import { products } from '@/data/products';
import { useStore } from '@/contexts/StoreContext';
import { availabilityLabel, cx, formatKsh } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const saved = products.filter((product) => wishlist.includes(product.id));

  return (
    <>
      <PageHeader
        eyebrow="Saved"
        title="Your Wishlist"
        body="Keep track of the pieces you are considering. Move them to your bag whenever you are ready."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]}
      />

      <div className="mx-auto max-w-page px-5 py-10 sm:px-8 lg:py-14">
        {saved.length === 0 ? (
          <EmptyState
            icon={<HeartIcon width={22} height={22} />}
            title="Nothing saved yet"
            body="Tap the heart on any piece to save it here while you decide."
            actionLabel="Browse the Collection"
            actionTo="/shop"
          />
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {saved.map((product) => {
              const soldOut = product.availability === 'out-of-stock';
              return (
                <li key={product.id} className="flex flex-wrap gap-5 py-6">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="h-40 w-32 shrink-0 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="label-luxe text-ink/45">
                      {product.category === 'human-hair'
                        ? 'Human Hair'
                        : 'Japanese Futura'}
                    </p>
                    <h2 className="mt-2 font-serif text-xl text-ink">
                      <Link
                        href={`/product/${product.slug}`}
                        className="hover:text-chestnut"
                      >
                        {product.name}
                      </Link>
                    </h2>
                    <p className="mt-1.5 text-xs text-ink/55">
                      {product.style} · {product.lengths[0]} in to{' '}
                      {product.lengths[product.lengths.length - 1]} in
                    </p>
                    <p className="mt-3 font-serif text-lg text-ink">
                      {formatKsh(product.price)}
                    </p>
                    <p
                      className={cx(
                        'mt-1 text-xs',
                        product.availability === 'in-stock' && 'text-emerald-700',
                        product.availability === 'low-stock' && 'text-chestnut',
                        soldOut && 'text-ink/45'
                      )}
                    >
                      {availabilityLabel(product.availability)}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2.5 sm:w-44">
                    <Button
                      disabled={soldOut}
                      onClick={() =>
                        addToCart(product, {
                          length:
                            product.lengths[
                              Math.floor(product.lengths.length / 2)
                            ],
                          color: product.colors[0].name,
                          capType: product.capTypes[0],
                        })
                      }
                    >
                      Move to Bag
                    </Button>
                    <Link
                      href={`/product/${product.slug}`}
                      className="label-luxe flex h-11 items-center justify-center border border-ink/25 text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-cream"
                    >
                      View Product
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="inline-flex items-center justify-center gap-1.5 text-[11px] tracking-wide text-ink/55 hover:text-chestnut"
                    >
                      <XIcon width={13} height={13} />
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}