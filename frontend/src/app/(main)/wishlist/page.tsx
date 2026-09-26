'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, ShoppingBagIcon, Trash2Icon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { fetchStoreProducts, formatProductFromBackend } from '@/utils/api';
import { formatKsh } from '@/utils/format';
import type { Product } from '@/types';
import { QuickViewModal } from '@/components/QuickViewModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function WishlistPage() {
  const {
    wishlist,
    removeFromWishlist,
    clearWishlist,
    addToCart,
    setCartOpen,
    pushToast,
  } = useStore();

  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Fetch all store products from backend
  useEffect(() => {
    let isMounted = true;
    fetchStoreProducts({ page_size: 100 })
      .then((res) => {
        if (!isMounted) return;
        const liveItems = (res.results || []).map(formatProductFromBackend);
        setCatalog(liveItems);
      })
      .catch(() => {
        if (!isMounted) return;
        setCatalog([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products that are in the user's wishlist
  const wishlistedProducts = useMemo(() => {
    if (wishlist.length === 0) return [];
    const wishlistSet = new Set(wishlist.map(String));
    return catalog.filter((p) => wishlistSet.has(String(p.id)));
  }, [catalog, wishlist]);

  // Remove a single product from wishlist
  const handleRemove = (productId: string, productName: string) => {
    removeFromWishlist(productId);
    pushToast({
      title: 'Removed from wishlist.',
      body: productName,
      tone: 'info',
    });
  };

  // Move product to cart (adds to bag and removes from wishlist)
  const handleMoveToCart = (product: Product) => {
    addToCart(product, {
      size: product.sizes?.[0]?.name,
      length: product.lengths?.[0],
      color: product.colors?.[0]?.name,
      price: product.price,
    });
    // Remove from wishlist so it transitions into the cart
    removeFromWishlist(product.id);
    pushToast({
      title: 'Moved to your bag.',
      body: `${product.name} is now ready for checkout.`,
      tone: 'success',
    });
    setCartOpen(true);
  };

  // Move all wishlist items to cart
  const handleMoveAllToCart = () => {
    wishlistedProducts.forEach((product) => {
      addToCart(product, {
        size: product.sizes?.[0]?.name,
        length: product.lengths?.[0],
        color: product.colors?.[0]?.name,
        price: product.price,
      });
    });
    clearWishlist();
    pushToast({
      title: 'All saved items moved to bag.',
      body: `${wishlistedProducts.length} ${wishlistedProducts.length === 1 ? 'item' : 'items'} added to your cart.`,
      tone: 'success',
    });
    setCartOpen(true);
  };

  return (
    <main className="min-h-[70vh] bg-cream/40">
      {/* Page Header */}
      <div className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-page px-5 py-8 sm:px-8 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-chestnut">
                Saved Items
              </p>
              <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
                My Wishlist
              </h1>
              <p className="mt-1 text-sm text-ink/60">
                {wishlist.length === 0
                  ? 'No items saved yet'
                  : `${wishlist.length} ${wishlist.length === 1 ? 'piece' : 'pieces'} saved for later`}
              </p>
            </div>

            {wishlistedProducts.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearWishlist}
                  className="text-xs tracking-wider"
                >
                  Clear Wishlist
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMoveAllToCart}
                  className="flex items-center gap-2"
                >
                  <ShoppingBagIcon width={16} height={16} />
                  <span>Move All to Bag</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="mx-auto max-w-page px-5 py-10 sm:px-8 sm:py-14">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-[4/5] w-full rounded bg-ink/10" />
                <div className="h-4 w-3/4 rounded bg-ink/10" />
                <div className="h-3 w-1/2 rounded bg-ink/10" />
              </div>
            ))}
          </div>
        ) : wishlistedProducts.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={<HeartIcon width={24} height={24} />}
              title="Your Wishlist is Empty"
              body="Save your favourite HD lace wigs and bundles to revisit them anytime, compare textures, and keep track of availability."
              actionLabel="Explore Collection"
              actionTo="/"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {wishlistedProducts.map((product) => {
              const primaryImage =
                product.colors?.[0]?.image ||
                product.images?.[0] ||
                '/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg';

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col border border-ink/10 bg-white p-4 transition-all duration-300 hover:shadow-md"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-stone-100">
                    <Link
                      href={`/product/${product.slug}`}
                      className="block aspect-[4/5] w-full overflow-hidden"
                    >
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Quick Remove Button (Top Right Trash Icon) */}
                    <button
                      type="button"
                      onClick={() => handleRemove(product.id, product.name)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      title="Remove from wishlist"
                      className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink/60 shadow-sm transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2Icon width={15} height={15} />
                    </button>

                    {/* Quick View Button */}
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(product)}
                      className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink shadow-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-white"
                    >
                      Quick View
                    </button>
                  </div>

                  {/* Details */}
                  <div className="mt-3 flex flex-1 flex-col">
                    {product.category && (
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-chestnut">
                        {product.category}
                      </p>
                    )}
                    <h3 className="mt-1 font-serif text-base text-ink line-clamp-1 hover:text-chestnut">
                      <Link href={`/product/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="mt-1 font-serif text-sm font-medium text-ink">
                      {formatKsh(product.price)}
                    </p>

                    {/* Actions: Move to Bag + Remove */}
                    <div className="mt-auto pt-4 flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMoveToCart(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs"
                      >
                        <ShoppingBagIcon width={13} height={13} />
                        <span>Move to Bag</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleRemove(product.id, product.name)}
                        title="Remove from wishlist"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-ink/15 text-ink/40 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2Icon width={15} height={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </main>
  );
}
