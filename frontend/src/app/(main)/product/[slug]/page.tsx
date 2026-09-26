'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from '@/components/RouterCompat';
import { HeartIcon, MinusIcon, PlusIcon, SparklesIcon } from 'lucide-react';
import type { Product } from '@/types';
import { useStore } from '@/contexts/StoreContext';
import { availabilityLabel, cx, formatKsh } from '@/utils/format';
import { fetchStoreProductDetail, fetchStoreProducts, formatProductFromBackend, type StoreProductListItem } from '@/utils/api';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { WriteReviewModal } from '@/components/WriteReviewModal';
import { SectionHeading } from '@/components/SectionHeading';
import { ReviewCard } from '@/components/ReviewCard';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState } from '@/components/ui/EmptyState';

/**
 * Multi-tier related products selection logic:
 * 1. Same Category (primary priority: matched by categorySlug or category name)
 * 2. Same Hairstyle / Texture (matched by hairstyleSlug or style name)
 * 3. Similar Price Bracket (within +/- 35% of current price)
 * 4. Overlapping Lengths / Sizes
 * 5. Featured / Best Seller products in the store
 * 6. Any other active items in the live backend catalog
 */
function computeRelatedProducts(
  current: Product,
  backendCandidates: Product[]
): Product[] {
  const result: Product[] = [];
  const addedIds = new Set<string>([String(current.id)]);

  const add = (p: Product) => {
    if (!p || addedIds.has(String(p.id))) return false;
    addedIds.add(String(p.id));
    result.push(p);
    return true;
  };

  const TARGET_COUNT = 4;

  const livePool = backendCandidates.filter(
    (p) => String(p.id) !== String(current.id) && p.slug !== current.slug
  );

  const norm = (s?: string) => (s || '').trim().toLowerCase();
  const currentCat = norm(current.category);
  const currentCatSlug = norm(current.categorySlug);
  const currentStyle = norm(current.style);
  const currentStyleSlug = norm(current.hairstyleSlug);

  // 1. Same Category (PRIMARY PRIORITY)
  for (const p of livePool) {
    const pCat = norm(p.category);
    const pCatSlug = norm(p.categorySlug);
    const isSameCategory =
      (currentCatSlug && pCatSlug && currentCatSlug === pCatSlug) ||
      (currentCat && pCat && currentCat === pCat);

    if (isSameCategory) {
      add(p);
      if (result.length >= TARGET_COUNT) return result;
    }
  }

  // 2. Same Hairstyle / Texture
  for (const p of livePool) {
    const pStyle = norm(p.style);
    const pStyleSlug = norm(p.hairstyleSlug);
    const isSameStyle =
      (currentStyleSlug && pStyleSlug && currentStyleSlug === pStyleSlug) ||
      (currentStyle && pStyle && currentStyle === pStyle);

    if (isSameStyle) {
      add(p);
      if (result.length >= TARGET_COUNT) return result;
    }
  }

  // 3. Similar Price Bracket (within +/- 35% range)
  if (current.price > 0) {
    for (const p of livePool) {
      if (p.price > 0) {
        const diff = Math.abs(p.price - current.price) / current.price;
        if (diff <= 0.35) {
          add(p);
          if (result.length >= TARGET_COUNT) return result;
        }
      }
    }
  }

  // 4. Overlapping Lengths / Sizes
  if (current.lengths && current.lengths.length > 0) {
    const currentLenSet = new Set(current.lengths);
    for (const p of livePool) {
      if (p.lengths && p.lengths.some((l) => currentLenSet.has(l))) {
        add(p);
        if (result.length >= TARGET_COUNT) return result;
      }
    }
  }

  // 5. Featured / Best Seller products
  for (const p of livePool) {
    if (p.badges?.includes('featured') || p.badges?.includes('bestseller')) {
      add(p);
      if (result.length >= TARGET_COUNT) return result;
    }
  }

  // 6. Any other active items in the live backend catalog
  for (const p of livePool) {
    add(p);
    if (result.length >= TARGET_COUNT) return result;
  }

  return result;
}

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | undefined>(() => (slug ? undefined : undefined));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, markViewed } = useStore();

  const [size, setSize] = useState<string>('');
  const [length, setLength] = useState<number>(0);
  const [color, setColor] = useState<string>('');
  const [capType, setCapType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    fetchStoreProductDetail(slug)
      .then((detail) => {
        if (!isMounted) return;
        const p = formatProductFromBackend(detail);
        setProduct(p);
        setSize(p.sizes?.[0]?.name ?? '');
        setLength(p.lengths?.[Math.floor(((p.lengths?.length || 1) - 1) / 2)] ?? 0);
        setColor(p.colors?.[0]?.name ?? '');
        setCapType(p.capTypes?.[0] ?? '');
      })
      .catch(() => {
        // Product not found in backend
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (product) {
      markViewed(product.id);
    }
  }, [product, markViewed]);

  useEffect(() => {
    if (!product) return;
    let isMounted = true;

    const fetchCategoryProducts = product.categorySlug
      ? fetchStoreProducts({ category: product.categorySlug, page_size: 16 }).catch(() => null)
      : Promise.resolve(null);
    const fetchGeneralProducts = fetchStoreProducts({ page_size: 36 }).catch(() => null);

    Promise.all([fetchCategoryProducts, fetchGeneralProducts]).then(([catRes, genRes]) => {
      if (!isMounted) return;

      const candidatesMap = new Map<string, Product>();

      if (catRes && catRes.results) {
        catRes.results.forEach((item: StoreProductListItem) => {
          const p = formatProductFromBackend(item);
          candidatesMap.set(p.id, p);
        });
      }

      if (genRes && genRes.results) {
        genRes.results.forEach((item: StoreProductListItem) => {
          const p = formatProductFromBackend(item);
          candidatesMap.set(p.id, p);
        });
      }

      const backendCandidates = Array.from(candidatesMap.values());
      const selected = computeRelatedProducts(product, backendCandidates);
      setRelatedProducts(selected);
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, product?.category, product?.categorySlug, product?.style, product?.price]);

  const selectedSizeObj = useMemo(() => {
    return product?.sizes?.find((s) => s.name === size);
  }, [product, size]);

  const selectedColorObj = useMemo(() => {
    return product?.colors?.find((c) => c.name === color);
  }, [product, color]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (selectedSizeObj?.price != null) return selectedSizeObj.price;
    if (selectedColorObj?.price != null) return selectedColorObj.price;
    return product.price;
  }, [product, selectedSizeObj, selectedColorObj]);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const productReviews = useMemo(() => {
    return product?.reviews && product.reviews.length > 0 ? product.reviews : [];
  }, [product]);

  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return product?.rating || 0;
    const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
    return Number((total / productReviews.length).toFixed(1));
  }, [productReviews, product?.rating]);

  const reviewCount = useMemo(() => {
    return productReviews.length;
  }, [productReviews]);

  if (loading && !product) {
    return (
      <div className="mx-auto max-w-page px-5 py-20 sm:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-ink/10" />
          <div className="h-72 w-full rounded-lg bg-ink/5" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-page px-5 py-20 sm:px-8">
        <EmptyState
          icon={<SparklesIcon width={22} height={22} />}
          title="We could not find that piece"
          body="It may have been renamed or removed from the collection. Browse the full collection to find something similar."
          actionLabel="Shop Wigs"
          actionTo="/"
        />
      </div>
    );
  }

  const soldOut = product.availability === 'out-of-stock';

  return (
    <>
      <div className="mx-auto grid max-w-page gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <ProductGallery
          images={product.images}
          name={product.name}
          activeImage={selectedColorObj?.image}
        />

        <div>
          {product.category && (
            <p className="label-luxe text-chestnut">
              {product.category}
            </p>
          )}
          <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            {product.name}
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {averageRating > 0 && reviewCount > 0 ? (
              <StarRating rating={averageRating} count={reviewCount} />
            ) : null}
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="text-xs text-ink/60 hover:text-ink underline transition-colors"
            >
              {reviewCount > 0 ? 'Write a review' : 'Be the first to review'}
            </button>
            <span
              className={cx(
                'text-xs tracking-wide',
                product.availability === 'in-stock' && 'text-emerald-700',
                product.availability === 'low-stock' && 'text-chestnut',
                soldOut && 'text-ink/45'
              )}
            >
              {availabilityLabel(product.availability)}
              {product.availability === 'low-stock' && ` — only ${product.stock} left`}
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <p className="font-serif text-3xl text-ink">{formatKsh(currentPrice)}</p>
            {product.compareAtPrice && (
              <p className="text-sm text-ink/40 line-through">
                {formatKsh(product.compareAtPrice)}
              </p>
            )}
          </div>

          <div className="rule-gold my-8" />

          {product.colors && product.colors.length > 0 && (
            <div>
              <p className="label-luxe mb-3 text-ink/55">
                Colour — <span className="text-ink">{color}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setColor(option.name)}
                    aria-pressed={color === option.name}
                    aria-label={option.name}
                    title={option.name}
                    className={cx(
                      'h-10 w-10 rounded-full border-2 transition-colors duration-200',
                      color === option.name ? 'border-gold ring-2 ring-gold/40' : 'border-ink/15 hover:border-ink/40'
                    )}
                    style={{ backgroundColor: option.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-7">
              <p className="label-luxe mb-3 text-ink/55">
                Size / Length {size && <span className="text-ink">— {size}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setSize(option.name)}
                    aria-pressed={size === option.name}
                    className={cx(
                      'h-11 min-w-16 border px-3 text-sm transition-colors duration-200',
                      size === option.name
                        ? 'border-gold bg-gold/15 font-semibold text-ink ring-1 ring-gold'
                        : 'border-ink/20 text-ink/70 hover:border-ink/50'
                    )}
                  >
                    <span>{option.name}</span>
                    {option.price != null && option.price !== product.price && (
                      <span className="ml-1.5 text-xs text-chestnut">
                        ({formatKsh(option.price)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-ink/20">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-12 w-12 items-center justify-center text-ink/70 hover:text-ink"
              >
                <MinusIcon width={15} height={15} />
              </button>
              <span className="w-10 text-center text-sm" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex h-12 w-12 items-center justify-center text-ink/70 hover:text-ink"
              >
                <PlusIcon width={15} height={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={cx(
                'flex h-12 w-12 items-center justify-center border transition-colors duration-200',
                isWishlisted(product.id)
                  ? 'border-chestnut text-chestnut'
                  : 'border-ink/20 text-ink/60 hover:border-ink/50 hover:text-ink'
              )}
              aria-pressed={isWishlisted(product.id)}
              aria-label="Save to wishlist"
            >
              <HeartIcon
                width={17}
                height={17}
                className={isWishlisted(product.id) ? 'fill-chestnut' : ''}
              />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              disabled={soldOut}
              onClick={() =>
                addToCart(product, {
                  length: length || undefined,
                  size: size || undefined,
                  color: color || undefined,
                  capType: capType || undefined,
                  quantity,
                  price: currentPrice,
                })
              }
            >
              {soldOut ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              disabled={soldOut}
              onClick={() => {
                addToCart(product, {
                  length: length || undefined,
                  size: size || undefined,
                  color: color || undefined,
                  capType: capType || undefined,
                  quantity,
                  price: currentPrice,
                });
                navigate('/checkout');
              }}
            >
              Buy Now
            </Button>
          </div>

          {soldOut && (
            <p className="mt-4 border border-ink/15 bg-white px-4 py-3 text-xs leading-relaxed text-ink/60">
              This piece is currently out of stock, so it cannot be added to a bag. Contact us on{' '}
              <a href="/contact" className="text-chestnut underline underline-offset-4">
                the contact page
              </a>{' '}
              to be told when it returns.
            </p>
          )}

          <div className="mt-10">
            <Accordion
              defaultOpen={0}
              items={[
                ...(product.description
                  ? [
                      {
                        title: 'Product Description',
                        content: <p className="whitespace-pre-line leading-relaxed">{product.description}</p>,
                      },
                    ]
                  : []),
                ...(product.specifications && product.specifications.length > 0
                  ? [
                      {
                        title: 'Specifications',
                        content: (
                          <dl className="divide-y divide-ink/10">
                            {product.specifications.map((spec) => (
                              <div key={spec.label} className="flex justify-between gap-6 py-2.5">
                                <dt className="text-ink/55">{spec.label}</dt>
                                <dd className="text-right font-medium text-ink/80">{spec.value}</dd>
                              </div>
                            ))}
                          </dl>
                        ),
                      },
                    ]
                  : []),
                {
                  title: 'Delivery & Shipping',
                  content: (
                    <p className="leading-relaxed">
                      Delivery options and fees are calculated at checkout. Express dispatch is available for orders within Nairobi, with nationwide courier service across Kenya.
                    </p>
                  ),
                },
                {
                  title: 'Care & Maintenance',
                  content: (
                    <p className="leading-relaxed">
                      Gently cleanse in lukewarm water using a sulfate-free shampoo. Detangle from ends to roots with a wide-tooth comb and allow to air dry for optimal longevity.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {productReviews.length > 0 && (
        <section aria-labelledby="product-reviews" className="mx-auto max-w-page px-5 py-14 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Reviews"
              title={`${averageRating.toFixed(1)} out of 5 (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReviewModalOpen(true)}
              className="text-xs uppercase tracking-wider"
            >
              Write a Review
            </Button>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {productReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="related-heading" className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-page px-3.5 py-10 sm:px-8 sm:py-14">
          <SectionHeading eyebrow="You May Also Like" title="More from this range" />
          {relatedProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink/60">No additional products found.</p>
          )}
        </div>
      </section>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <WriteReviewModal
        productName={product.name}
        productSlug={product.slug}
        productId={product.id}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onReviewSubmitted={(newReview) => {
          setProduct((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              reviews: [newReview, ...(prev.reviews || [])],
            };
          });
        }}
      />
    </>
  );
}