'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CartItem, Order, Product } from '../types';
import {
  fetchCurrentUser,
  forgotPassword as apiForgotPassword,
  login as apiLogin,
  loginWithGoogle as apiLoginWithGoogle,
  logout as apiLogout,
  registerCustomer,
  resendVerificationCode,
  resetPassword as apiResetPassword,
  updateCurrentUser as apiUpdateCurrentUser,
  verifyEmail as apiVerifyEmail,
  type AuthUser,
  type MessageResponse,
  setCsrfTokenGetter,
  setCsrfTokenSetter,
} from '../utils/api';

interface ToastMessage {
  id: number;
  title: string;
  body?: string;
  tone: 'success' | 'info' | 'error';
}

interface AddToCartOptions {
  length?: number;
  size?: string;
  color?: string;
  capType?: string;
  quantity?: number;
  price?: number;
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
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isWishlisted: (id: string) => boolean;
  recentlyViewed: string[];
  markViewed: (id: string) => void;
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: number) => void;
  user: AuthUser | null;
  authReady: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: (credential: string) => Promise<AuthUser>;
  register: (fields: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ email: string; message: string }>;
  verifyEmail: (email: string, code: string) => Promise<AuthUser>;
  resendCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<MessageResponse>;
  resetPassword: (email: string, code: string, new_password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  updateUserProfile: (payload: Partial<AuthUser>) => Promise<AuthUser>;
  lastOrder: Order | null;
  placeOrder: (order: Order) => void;
  discount: { code: string; amount: number } | null;
  applyDiscount: (code: string) => boolean;
  csrfToken: string | null;
}

const StoreContext = createContext<StoreValue | null>(null);

let toastId = 0;

const CART_STORAGE_KEY = 'dallian_cart_v1';
const WISHLIST_STORAGE_KEY = 'dallian_wishlist_v1';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface StoredCartEnvelope {
  items: CartItem[];
  updatedAt: number;
  expiresAt: number;
}

interface StoredWishlistEnvelope {
  items: string[];
  updatedAt: number;
  expiresAt: number;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Flag to avoid overwriting storage during initial hydration
  const isHydratedRef = useRef(false);

  // 1. On mount: Restore cart & wishlist if within the 7-day window
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const rawCart = localStorage.getItem(CART_STORAGE_KEY);
      if (rawCart) {
        const envelope: StoredCartEnvelope = JSON.parse(rawCart);
        if (envelope && Array.isArray(envelope.items)) {
          const now = Date.now();
          if (envelope.expiresAt && now < envelope.expiresAt) {
            setCart(envelope.items);
          } else {
            // Expired after 7 days of inactivity
            localStorage.removeItem(CART_STORAGE_KEY);
          }
        }
      }

      const rawWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (rawWishlist) {
        const envelope: StoredWishlistEnvelope = JSON.parse(rawWishlist);
        if (envelope && Array.isArray(envelope.items)) {
          if (envelope.expiresAt && Date.now() < envelope.expiresAt) {
            setWishlist(envelope.items);
          } else {
            localStorage.removeItem(WISHLIST_STORAGE_KEY);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading cart or wishlist from storage', e);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // 2. Persist cart with a 7-day sliding expiry whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydratedRef.current) return;

    try {
      if (cart.length === 0) {
        localStorage.removeItem(CART_STORAGE_KEY);
        document.cookie = 'dallian_cart_active=; path=/; max-age=0; SameSite=Lax';
      } else {
        const now = Date.now();
        const envelope: StoredCartEnvelope = {
          items: cart,
          updatedAt: now,
          expiresAt: now + SEVEN_DAYS_MS,
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(envelope));

        // 7-day cookie backup (7 * 86400 seconds)
        document.cookie = `dallian_cart_active=true; path=/; max-age=${7 * 86400}; SameSite=Lax`;
      }
    } catch (e) {
      console.warn('Error saving cart to storage', e);
    }
  }, [cart]);

  // 3. Persist wishlist with a 7-day sliding expiry whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydratedRef.current) return;

    try {
      if (wishlist.length === 0) {
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
      } else {
        const now = Date.now();
        const envelope: StoredWishlistEnvelope = {
          items: wishlist,
          updatedAt: now,
          expiresAt: now + SEVEN_DAYS_MS,
        };
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(envelope));
      }
    } catch (e) {
      console.warn('Error saving wishlist to storage', e);
    }
  }, [wishlist]);

  // Provide CSRF token to API client
  useEffect(() => {
    setCsrfTokenGetter(() => csrfToken);
    setCsrfTokenSetter((token) => setCsrfToken(token));
  }, [csrfToken]);

  // Automatically log out and redirect when session expires
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setCsrfToken(null);
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/admin') || path.startsWith('/customer')) {
          window.location.href = '/login';
        }
      }
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);
  const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);

  // On first load, see if the browser already carries a valid session cookie
  // (e.g. the customer refreshed the page) and restore the user silently.
  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser()
      .then((me) => {
        if (!cancelled) {
          setUser(me);
          if ((me as unknown as { csrfToken?: string })?.csrfToken) {
            setCsrfToken((me as unknown as { csrfToken: string }).csrfToken);
          }
        }
      })
      .catch(() => {
        // Not logged in, or the session expired — that's fine, stay signed out.
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const response = await apiLogin({ email, password });
      setCsrfToken(response.csrfToken);
      const me = await fetchCurrentUser();
      setUser(me);
      return me;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    setAuthLoading(true);
    try {
      const response = await apiLoginWithGoogle({ credential });
      if (response?.csrfToken) {
        setCsrfToken(response.csrfToken);
      }
      const me = await fetchCurrentUser();
      setUser(me);
      return me;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(
    (fields: { full_name: string; email: string; password: string; phone?: string }) =>
      registerCustomer(fields),
    []
  );

  const verifyEmail = useCallback(async (email: string, code: string) => {
    setAuthLoading(true);
    try {
      const response = await apiVerifyEmail({ email, code });
      setCsrfToken(response.csrfToken);
      const me = await fetchCurrentUser();
      setUser(me);
      return me;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const resendCode = useCallback(async (email: string) => {
    await resendVerificationCode({ email });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    return apiForgotPassword({ email });
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, new_password: string) => {
    setAuthLoading(true);
    try {
      const response = await apiResetPassword({ email, code, new_password });
      if (response?.csrfToken) {
        setCsrfToken(response.csrfToken);
      }
      const me = await fetchCurrentUser();
      setUser(me);
      return me;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Even if the network call fails, clear the local session.
    }
    setUser(null);
    setCsrfToken(null);
  }, []);

  const updateUserProfile = useCallback(async (payload: Partial<AuthUser>) => {
    const updated = await apiUpdateCurrentUser(payload);
    setUser(updated);
    return updated;
  }, []);

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
      const key = `${product.id}-${options.size ?? ''}-${options.length ?? ''}-${options.color ?? ''}-${options.capType ?? ''}`;
      setCart((prev) => {
        const existing = prev.find((item) => item.key === key && !item.savedForLater);
        if (existing) {
          return prev.map((item) =>
            item.key === key
              ? { ...item, quantity: item.quantity + (options.quantity ?? 1) }
              : item
          );
        }
        return [
          ...prev,
          {
            key,
            productId: product.id,
            name: product.name,
            image: product.images[0],
            price: options.price != null ? options.price : product.price,
            quantity: options.quantity ?? 1,
            length: options.length,
            size: options.size,
            color: options.color,
            capType: options.capType,
          },
        ];
      });
      setCartOpen(true);
      pushToast({ title: 'Added to your bag.', body: product.name, tone: 'success' });
    },
    [pushToast]
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const saveForLater = useCallback((key: string) => {
    setCart((prev) => prev.map((item) => (item.key === key ? { ...item, savedForLater: true } : item)));
  }, []);

  const moveToCart = useCallback((key: string) => {
    setCart((prev) => prev.map((item) => (item.key === key ? { ...item, savedForLater: false } : item)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlist((prev) => {
        const exists = prev.includes(product.id);
        pushToast({
          title: exists ? 'Removed from wishlist.' : 'Saved to wishlist.',
          body: product.name,
          tone: 'info',
        });
        return exists ? prev.filter((id) => id !== product.id) : [...prev, product.id];
      });
    },
    [pushToast]
  );

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

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

  const placeOrder = useCallback((order: Order) => {
    setLastOrder(order);
    setCart([]);
    setDiscount(null);
  }, []);

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
    removeFromWishlist,
    clearWishlist,
    isWishlisted: (id: string) => wishlist.includes(id),
    recentlyViewed,
    markViewed,
    toasts,
    pushToast,
    dismissToast,
    user,
    authReady,
    authLoading,
    login,
    loginWithGoogle,
    register,
    verifyEmail,
    resendCode,
    forgotPassword,
    resetPassword,
    signOut,
    updateUserProfile,
    lastOrder,
    placeOrder,
    discount,
    applyDiscount,
    csrfToken,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}