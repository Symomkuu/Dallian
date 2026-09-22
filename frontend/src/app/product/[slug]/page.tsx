'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from '@/components/RouterCompat';
import { HeartIcon, MinusIcon, PlusIcon, SparklesIcon } from 'lucide-react';
import { getProduct, products } from '@/data/products';
import { reviews } from '@/data/content';
import { useStore } from '@/contexts/StoreContext';
import { availabilityLabel, cx, formatKsh } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductCard } from '@/components/ProductCard';
import { SectionHeading } from '@/components/SectionHeading';
import { ReviewCard } from '@/components/ReviewCard';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState } from '@/components/ui/EmptyState';

const loveCards = [
  { title: 'Premium Quality', body: 'Selected by our team for finish, density and feel.' },
  { title: 'Elegant Finish', body: 'Neat parting, tidy edges and a natural-looking hairline.' },
  { title: 'Comfortable Fit', body: 'Adjustable cap construction for all-day wear.' },
  { title: 'Carefully Selected', body: 'Each style is chosen for how it wears in real life.' },
];

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProduct(slug) : undefined;
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, markViewed } = useStore();

  const initialLength = product?.lengths[Math.floor((product.lengths.length - 1) / 2)] ?? 0;
  const initialColor = product?.colors[0]?.name ?? '';
  const initialCapType = product?.capTypes[0] ?? '';

  const [length, setLength] = useState<number>(initialLength);
  const [color, setColor] = useState<string>(initialColor);
  const [capType, setCapType] = useState<string>(initialCapType);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      markViewed(product.id);
    }
  }, [product, markViewed]);

  // Sync state if initial variables load after mount
  useEffect(() => {
    if (product) {
      setLength(product.lengths[Math.floor((product.lengths.length - 1) / 2)] ?? 0);
      setColor(product.colors[0]?.name ?? '');
      setCapType(product.capTypes[0] ?? '');
    }
  }, [product]);

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === product?.id && r.status === 'published'),
    [product]
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-page px-5 py-20 sm:px-8">
        <EmptyState
          icon={<SparklesIcon width={22} height={22} />}
          title="We could not find that piece"
          body="It may have been renamed or removed from the collection. Browse the full collection to find something similar."
          actionLabel="Shop Wigs"
          actionTo="/shop"
        />
      </div>
    );
  }

  const soldOut = product.availability === 'out-of-stock';
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <>
      <PageHeader
        title={product.name}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          {
            label: product.category === 'human-hair' ? 'Human Hair' : 'Japanese Futura',
            to: `/shop?category=${product.category}`,
          },
          { label: product.name },
        ]}
      />

      <div className="mx-auto grid max-w-page gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <p className="label-luxe text-ink/45">
            {product.category === 'human-hair' ? 'Premium Human Hair' : 'Japanese Futura Fibre'}
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            {product.name}
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <StarRating rating={product.rating} count={product.reviewCount} />
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
            <p className="font-serif text-3xl text-ink">{formatKsh(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-sm text-ink/40 line-through">
                {formatKsh(product.compareAtPrice)}
              </p>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink/70">
            {product.shortDescription}
          </p>

          <div className="rule-gold my-8" />

          <div>
            <p className="label-luxe mb-3 text-ink/55">
              Colour — <span className="text-ink">{color}</span>
            </p>
            <div className="flex gap-3">
              {product.colors.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setColor(option.name)}
                  aria-pressed={color === option.name}
                  aria-label={option.name}
                  className={cx(
                    'h-10 w-10 rounded-full border-2 transition-colors duration-200',
                    color === option.name ? 'border-gold' : 'border-ink/15 hover:border-ink/40'
                  )}
                  style={{ backgroundColor: option.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="label-luxe mb-3 text-ink/55">Length</p>
            <div className="flex flex-wrap gap-2">
              {product.lengths.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLength(option)}
                  aria-pressed={length === option}
                  className={cx(
                    'h-11 min-w-14 border px-3 text-sm transition-colors duration-200',
                    length === option
                      ? 'border-gold bg-gold/15 text-ink'
                      : 'border-ink/20 text-ink/70 hover:border-ink/50'
                  )}
                >
                  {option} in
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="label-luxe mb-3 text-ink/55">Cap</p>
            <div className="flex flex-wrap gap-2">
              {product.capTypes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCapType(option)}
                  aria-pressed={capType === option}
                  className={cx(
                    'h-11 border px-4 text-sm transition-colors duration-200',
                    capType === option
                      ? 'border-gold bg-gold/15 text-ink'
                      : 'border-ink/20 text-ink/70 hover:border-ink/50'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

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
              onClick={() => addToCart(product, { length, color, capType, quantity })}
            >
              {soldOut ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              disabled={soldOut}
              onClick={() => {
                addToCart(product, { length, color, capType, quantity });
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
                {
                  title: 'Product Description',
                  content: <p>{product.description}</p>,
                },
                {
                  title: 'Features',
                  content: (
                    <ul className="space-y-2">
                      {product.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: 'Specifications',
                  content: (
                    <dl className="divide-y divide-ink/10">
                      {product.specifications.map((spec) => (
                        <div key={spec.label} className="flex justify-between gap-6 py-2.5">
                          <dt className="text-ink/55">{spec.label}</dt>
                          <dd className="text-right text-ink/80">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ),
                },
                {
                  title: "What's Included",
                  content: (
                    <ul className="space-y-2">
                      {product.included.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: 'Wig Care',
                  content: (
                    <p>
                      Follow the routine in our{' '}
                      <Link
                        to="/wig-care"
                        className="text-chestnut underline underline-offset-4"
                      >
                        Wig Care Guide
                      </Link>{' '}
                      for washing, storage and detangling guidance for this range.
                    </p>
                  ),
                },
                {
                  title: 'Delivery Information',
                  content: (
                    <p>
                      Delivery options, fees and timelines are configured by Dallian Luxe Hair and
                      shown at checkout. See{' '}
                      <Link
                        to="/delivery"
                        className="text-chestnut underline underline-offset-4"
                      >
                        Delivery Information
                      </Link>
                      .
                    </p>
                  ),
                },
                {
                  title: 'Returns',
                  content: (
                    <p>
                      Returns follow the policy published by the business. See{' '}
                      <Link
                        to="/returns"
                        className="text-chestnut underline underline-offset-4"
                      >
                        Returns Policy
                      </Link>
                      .
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <section aria-labelledby="love-heading" className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-page px-5 py-14 sm:px-8">
          <SectionHeading eyebrow="Why You'll Love It" title="Details that make the difference" />
          <ul className="mt-9 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {loveCards.map((card) => (
              <li key={card.title} className="bg-white p-7">
                <h3 className="font-serif text-lg text-ink">{card.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink/60">{card.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="product-reviews" className="mx-auto max-w-page px-5 py-14 sm:px-8">
        <SectionHeading eyebrow="Reviews" title={`${product.rating.toFixed(1)} out of 5`} />
        {productReviews.length > 0 ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {productReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink/60">
            No published reviews for this piece yet. Verified customers can review after delivery.
          </p>
        )}
      </section>

      <section aria-labelledby="related-heading" className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-page px-5 py-14 sm:px-8">
          <SectionHeading eyebrow="You May Also Like" title="More from this range" />
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}