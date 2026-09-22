import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MinusIcon, PlusIcon, ShoppingBagIcon, XIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { formatKsh } from '../utils/format';
import { Button, LinkButton } from './ui/Button';

export function CartDrawer() {
  const { cartOpen, setCartOpen, activeCart, subtotal, updateQuantity, removeItem } = useStore();

  return (
    <AnimatePresence>
      {cartOpen &&
      <div className="fixed inset-0 z-[65]">
          <motion.button
          type="button"
          aria-label="Close bag"
          onClick={() => setCartOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-ink/55" />
        
          <motion.aside
          role="dialog"
          aria-label="Shopping bag"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-panel">
          
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="font-serif text-xl text-ink">Your Bag</h2>
              <button
              type="button"
              onClick={() => setCartOpen(false)}
              aria-label="Close bag"
              className="p-1.5 text-ink/60 transition-colors duration-150 hover:text-ink">
              
                <XIcon width={20} height={20} />
              </button>
            </div>

            {activeCart.length === 0 ?
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBagIcon width={28} height={28} className="text-chestnut" />
                <p className="mt-4 font-serif text-xl text-ink">Your bag is empty</p>
                <p className="mt-2 text-sm text-ink/60">
                  Explore the signature collection to find your next look.
                </p>
                <LinkButton to="/shop" className="mt-6" onClick={() => setCartOpen(false)}>
                  Shop Wigs
                </LinkButton>
              </div> :

          <>
                <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
                  {activeCart.map((item) =>
              <li key={item.key} className="flex gap-4 py-5">
                      <img src={item.image} alt="" className="h-28 w-22 shrink-0 object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-base text-ink">{item.name}</p>
                        <p className="mt-1 text-xs text-ink/55">
                          {item.length}" · {item.color} · {item.capType}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center border border-ink/20">
                            <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center text-ink/70 hover:text-ink">
                        
                              <MinusIcon width={13} height={13} />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center text-ink/70 hover:text-ink">
                        
                              <PlusIcon width={13} height={13} />
                            </button>
                          </div>
                          <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="text-[11px] tracking-wide text-ink/50 underline-offset-4 transition-colors duration-150 hover:text-chestnut hover:underline">
                      
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm text-ink">{formatKsh(item.price * item.quantity)}</p>
                    </li>
              )}
                </ul>

                <div className="border-t border-ink/10 bg-white px-6 py-5">
                  <div className="flex items-center justify-between">
                    <span className="label-luxe text-ink/55">Subtotal</span>
                    <span className="font-serif text-xl text-ink">{formatKsh(subtotal)}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-ink/50">
                    Delivery and any discount are calculated at checkout.
                  </p>
                  <LinkButton to="/checkout" size="lg" className="mt-4 w-full" onClick={() => setCartOpen(false)}>
                    Proceed to Checkout
                  </LinkButton>
                  <div className="mt-2 flex gap-2">
                    <LinkButton
                  to="/cart"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setCartOpen(false)}>
                  
                      View Bag
                    </LinkButton>
                    <Button variant="ghost" className="w-full" onClick={() => setCartOpen(false)}>
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </>
          }
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}