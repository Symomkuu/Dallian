import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { CartItem, Order, Product } from '../types';

interface ToastMessage {
  id: number;
  title: string;
  body?: string;
  tone: 'success' | 'info' | 'error';
}

interface AddToCartOptions {
  length: number;
  color: string;
  capType: string;
  quantity?: number;
}

interface StoreValue {
  cart: CartItem[];
  activeCart: CartItem[];
  savedItems: CartItem[];
  cartCount: number;
  subtotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, options: AddToCartOptions) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  recentlyViewed: string[];
  markViewed: (id: string) => void;
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: number) => void;
  user: {name: string;email: string;} | null;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  lastOrder: Order | null;
  placeOrder: (order: Order) => void;
  discount: {code: string;amount: number;} | null;
  applyDiscount: (code: string) => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

let toastId = 0;

export function StoreProvider({ children }: {children: React.ReactNode;}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<{name: string;email: string;} | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [discount, setDiscount] = useState<{code: string;amount: number;} | null>(null);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToCart = useCallback(
    (product: Product, options: AddToCartOptions) => {
      const key = `${product.id}-${options.length}-${options.color}-${options.capType}`;
      setCart((prev) => {
        const existing = prev.find((item) => item.key === key && !item.savedForLater);
        if (existing) {
          return prev.map((item) =>
          item.key === key ?
          { ...item, quantity: item.quantity + (options.quantity ?? 1) } :
          item
          );
        }
        return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          image: product.images[0],
          price: product.price,
          quantity: options.quantity ?? 1,
          length: options.length,
          color: options.color,
          capType: options.capType
        }];

      });
      setCartOpen(true);
      pushToast({ title: 'Added to your bag.', body: product.name, tone: 'success' });
    },
    [pushToast]
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) =>
    prev.map((item) => item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item)
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const saveForLater = useCallback((key: string) => {
    setCart((prev) => prev.map((item) => item.key === key ? { ...item, savedForLater: true } : item));
  }, []);

  const moveToCart = useCallback((key: string) => {
    setCart((prev) => prev.map((item) => item.key === key ? { ...item, savedForLater: false } : item));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlist((prev) => {
        const exists = prev.includes(product.id);
        pushToast({
          title: exists ? 'Removed from wishlist.' : 'Saved to wishlist.',
          body: product.name,
          tone: 'info'
        });
        return exists ? prev.filter((id) => id !== product.id) : [...prev, product.id];
      });
    },
    [pushToast]
  );

  const markViewed = useCallback((id: string) => {
    setRecentlyViewed((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 6));
  }, []);

  const applyDiscount = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (normalized === 'LUXE10') {
        setDiscount({ code: normalized, amount: 0.1 });
        pushToast({ title: 'Discount applied.', body: '10% off your order', tone: 'success' });
        return true;
      }
      pushToast({ title: 'That code is not recognised.', body: 'Check the code and try again.', tone: 'error' });
      return false;
    },
    [pushToast]
  );

  const placeOrder = useCallback(
    (order: Order) => {
      setLastOrder(order);
      setCart([]);
      setDiscount(null);
    },
    []
  );

  const activeCart = useMemo(() => cart.filter((i) => !i.savedForLater), [cart]);
  const savedItems = useMemo(() => cart.filter((i) => i.savedForLater), [cart]);

  const value: StoreValue = {
    cart,
    activeCart,
    savedItems,
    cartCount: activeCart.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: activeCart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    cartOpen,
    setCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    clearCart,
    wishlist,
    toggleWishlist,
    isWishlisted: (id: string) => wishlist.includes(id),
    recentlyViewed,
    markViewed,
    toasts,
    pushToast,
    dismissToast,
    user,
    signIn: (name, email) => setUser({ name, email }),
    signOut: () => setUser(null),
    lastOrder,
    placeOrder,
    discount,
    applyDiscount
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}