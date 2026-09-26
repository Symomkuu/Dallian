'use client';

import React, { useState } from 'react';
import { Link } from '@/components/RouterCompat';
import { MinusIcon, PlusIcon, ShoppingBagIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { formatKsh } from '@/utils/format';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function Cart() {
  const {
    activeCart,
    savedItems,
    subtotal,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    discount,
    applyDiscount
  } = useStore();
  const [code, setCode] = useState('');

  const deliveryFee = subtotal > 0 ? 500 : 0;
  const discountAmount = discount ? Math.round(subtotal * discount.amount) : 0;
  const total = subtotal + deliveryFee - discountAmount;

  return (
    <>

      <div className="mx-auto max-w-page px-4 py-8 sm:px-8 lg:py-14 pb-28 lg:pb-14">
        {activeCart.length === 0 ? (
          <EmptyState
            icon={<ShoppingBagIcon width={22} height={22} />}
            title="Your bag is empty"
            body="Browse the signature collection and add the pieces you love. Nothing is reserved until checkout."
            actionLabel="Shop Wigs"
            actionTo="/" 
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
            <section aria-label="Cart items">
              <ul className="divide-y divide-ink/10 border-y border-ink/10">
                {activeCart.map((item) => (
                  <li key={item.key} className="flex gap-5 py-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="h-36 w-28 shrink-0 object-cover sm:h-44 sm:w-36" 
                    />
                    
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-xl text-ink">{item.name}</h2>
                          <p className="mt-1.5 text-xs text-ink/55">
                            {[
                              item.size ? `Size: ${item.size}` : item.length ? `${item.length} in` : null,
                              item.color ? `Colour: ${item.color}` : null,
                              item.capType || null,
                            ].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <p className="shrink-0 font-serif text-lg text-ink">
                          {formatKsh(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center gap-4 pt-5">
                        <div className="flex items-center border border-ink/20">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center text-ink/70 hover:text-ink"
                          >
                            <MinusIcon width={14} height={14} />
                          </button>
                          <span className="w-9 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center text-ink/70 hover:text-ink"
                          >
                            <PlusIcon width={14} height={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => saveForLater(item.key)}
                          className="text-[11px] tracking-wide text-ink/55 underline-offset-4 hover:text-chestnut hover:underline"
                        >
                          Save for later
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="text-[11px] tracking-wide text-ink/55 underline-offset-4 hover:text-chestnut hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {savedItems.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-serif text-xl text-ink">Saved for later</h2>
                  <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
                    {savedItems.map((item) => (
                      <li key={item.key} className="flex items-center gap-4 py-4">
                        <img src={item.image} alt="" className="h-20 w-16 object-cover" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-base text-ink">{item.name}</p>
                          <p className="text-xs text-ink/55">
                            {item.length} in · {item.color}
                          </p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => moveToCart(item.key)}>
                          Move to Bag
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                to="/"
                className="label-luxe mt-8 inline-flex border-b border-gold pb-1.5 text-ink hover:text-chestnut"
              >
                Continue Shopping
              </Link>
            </section>

            <aside aria-label="Order summary" className="lg:sticky lg:top-28 lg:h-fit">
              <div className="border border-ink/10 bg-white p-6 sm:p-7 shadow-xs rounded-xl lg:rounded-none">
                <h2 className="font-serif text-xl text-ink">Order Summary</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink/60">Subtotal</dt>
                    <dd className="text-ink font-medium">{formatKsh(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink/60">Estimated Delivery</dt>
                    <dd className="text-ink font-medium">{formatKsh(deliveryFee)}</dd>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-chestnut">
                      <dt>Discount</dt>
                      <dd>− {formatKsh(discountAmount)}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-5">
                  <span className="label-luxe text-ink/55">Total</span>
                  <span className="font-serif text-2xl font-bold text-ink">{formatKsh(total)}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink/50">
                  Final delivery fee and method are selected during checkout.
                </p>

                <form
                  className="mt-6 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    applyDiscount(code);
                  }}
                >
                  <label htmlFor="discount-code" className="sr-only">
                    Discount code
                  </label>
                  <input
                    id="discount-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Promo or discount code"
                    className="h-11 flex-1 border border-ink/20 px-3 text-xs sm:text-sm focus:border-chestnut focus:outline-none bg-white" 
                  />
                  <Button type="submit" variant="secondary" className="px-4">
                    Apply
                  </Button>
                </form>

                <LinkButton to="/checkout" size="lg" className="mt-6 w-full h-13 shadow-sm">
                  Proceed to Checkout →
                </LinkButton>
              </div>
            </aside>
          </div>
        )}

        {/* Sticky Mobile Checkout Bar */}
        {activeCart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur-md px-5 py-3.5 lg:hidden shadow-lg">
            <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-ink/50">Total ({activeCart.length})</p>
                <p className="font-serif text-lg font-bold text-ink">{formatKsh(total)}</p>
              </div>
              <LinkButton to="/checkout" size="md" className="flex-1 max-w-[220px] h-11 bg-black text-white font-semibold">
                Proceed to Checkout →
              </LinkButton>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Cart;