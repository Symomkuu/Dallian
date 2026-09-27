'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { MinusIcon, PlusIcon, ShoppingBagIcon, XIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { formatKsh } from '../utils/format';
import { Button, LinkButton } from './ui/Button';

export function CartDrawer() {
  const { cartOpen, setCartOpen, activeCart, subtotal, updateQuantity, removeItem } = useStore();

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[65]">
          {/* Dark Overlay Backdrop */}
          <motion.button
            type="button"
            aria-label="Close bag"
            onClick={() => setCartOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 cursor-pointer border-none bg-black/40 outline-none"
          />

          {/* Slide-out Drawer Panel */}
          <motion.aside
            role="dialog"
            aria-label="Shopping bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#FAF7F2] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6">
              <h2 className="font-serif text-2xl font-normal text-stone-900">Your Bag</h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close bag"
                className="p-1 text-stone-600 transition-colors duration-150 hover:text-stone-900"
              >
                <XIcon width={20} height={20} />
              </button>
            </div>

            {/* Cart Items List */}
            {activeCart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBagIcon width={28} height={28} className="text-[#B36B39]" />
                <p className="mt-4 font-serif text-xl text-stone-900">Your bag is empty</p>
                <p className="mt-2 text-sm text-stone-500">
                  Explore the signature collection to find your next look.
                </p>
                <LinkButton to="/" className="mt-6" onClick={() => setCartOpen(false)}>
                  Shop Wigs
                </LinkButton>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-stone-200/60 overflow-y-auto px-8">
                  {activeCart.map((item) => (
                    <li key={item.key} className="flex gap-5 py-6">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-28 w-24 shrink-0 bg-stone-100 object-cover"
                        loading="lazy"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif text-lg font-normal text-stone-900">
                              {item.name}
                            </h3>
                            <span className="whitespace-nowrap font-serif text-base font-normal text-stone-900">
                              {formatKsh(item.price * item.quantity)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-stone-500">
                            {[
                              item.size ? `Size: ${item.size}` : item.length ? `${item.length}"` : null,
                              item.color ? `Colour: ${item.color}` : null,
                              item.capType || null,
                            ].filter(Boolean).join(' · ')}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center border border-stone-300 bg-transparent">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center text-stone-600 transition-colors hover:bg-stone-200/50"
                            >
                              <MinusIcon width={12} height={12} />
                            </button>
                            <span className="w-8 text-center font-serif text-sm text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              aria-label={`Increase quantity of ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center text-stone-600 transition-colors hover:bg-stone-200/50"
                            >
                              <PlusIcon width={12} height={12} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="text-xs text-stone-500 transition-colors hover:text-stone-900"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Footer Section */}
                <div className="border-t border-stone-200 bg-white px-8 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
                      Subtotal
                    </span>
                    <span className="font-serif text-2xl font-normal text-stone-900">
                      {formatKsh(subtotal)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">
                    Delivery and any discount are calculated at checkout.
                  </p>

                  <LinkButton
                    to="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="mt-6 flex h-12 w-full items-center justify-center bg-black text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-stone-800"
                  >
                    Proceed to Checkout
                  </LinkButton>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {/* View Bag - using direct Link with forced hover classes */}
                    <Link
                      href="/cart"
                      onClick={() => setCartOpen(false)}
                      className="flex h-12 items-center justify-center border border-black bg-white text-xs font-semibold uppercase tracking-[0.15em] text-black transition-all duration-200 hover:!bg-black hover:!text-white cursor-pointer"
                    >
                      View Bag
                    </Link>

                    {/* Continue Shopping */}
                    <button
                      type="button"
                      onClick={() => setCartOpen(false)}
                      className="flex h-12 items-center justify-center text-xs font-semibold uppercase tracking-[0.15em] text-black transition-colors duration-200 hover:text-[#B36B39] cursor-pointer"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}