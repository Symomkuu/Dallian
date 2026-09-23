'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  HeartIcon,
  MenuIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';

import { brand } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { cx } from '@/utils/format';
import { Logo } from './Logo';
import { SearchOverlay } from './SearchOverlay';

const navLinks = [
  { label: 'Home', to: '/home' },
  { label: 'Shop', to: '/' },
  { label: 'Wig Care', to: '/wig-care' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar() {
  const { cartCount, wishlist, setCartOpen, user } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = `${pathname}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ''
  }`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Top Announcement Bar - Explicitly styled black with high-contrast text */}
      <div className="bg-black text-white">
        <p className="mx-auto max-w-page px-5 py-2.5 text-center text-[10px] tracking-widest uppercase text-white/90 sm:px-8 sm:text-[11px]">
          {brand.announcement}
        </p>
      </div>

      <header
        className={cx(
          'sticky top-0 z-50 border-b bg-cream/95 backdrop-blur transition-[box-shadow,border-color] duration-300',
          scrolled ? 'border-ink/10 shadow-card' : 'border-transparent'
        )}
      >
        <div className="mx-auto flex max-w-page items-center gap-4 px-5 py-3.5 sm:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="-ml-1 p-2 text-ink lg:hidden"
          >
            <MenuIcon width={20} height={20} />
          </button>

          <Logo className="shrink-0" />

          <nav aria-label="Main" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = currentUrl === link.to;
                return (
                  <li key={link.label}>
                    <Link
                      href={link.to}
                      className={cx(
                        'label-luxe relative py-2 text-ink/70 transition-colors duration-200 hover:text-ink',
                        isActive && 'text-ink font-semibold'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-6">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="p-2.5 text-ink transition-colors duration-200 hover:text-chestnut"
            >
              <SearchIcon width={18} height={18} />
            </button>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishlist.length} items`}
              className="relative hidden p-2.5 text-ink transition-colors duration-200 hover:text-chestnut sm:block"
            >
              <HeartIcon width={18} height={18} />
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-chestnut px-1 text-[9px] font-medium text-cream">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping bag, ${cartCount} items`}
              className="relative p-2.5 text-ink transition-colors duration-200 hover:text-chestnut"
            >
              <ShoppingBagIcon width={18} height={18} />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-ink">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href={user ? '/account' : '/login'}
              aria-label={user ? 'My account' : 'Sign in'}
              className="hidden p-2.5 text-ink transition-colors duration-200 hover:text-chestnut sm:block"
            >
              <UserIcon width={18} height={18} />
            </Link>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/60"
          />

          <div className="relative flex h-full w-[86%] max-w-sm flex-col bg-cream shadow-panel">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <Logo compact />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="p-2"
              >
                <XIcon width={20} height={20} />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="divide-y divide-ink/10">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.to}
                      onClick={() => setMenuOpen(false)}
                      className="label-luxe block py-4 text-ink/80 transition-colors duration-150 hover:text-chestnut"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/track"
                    onClick={() => setMenuOpen(false)}
                    className="label-luxe block py-4 text-ink/80"
                  >
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    onClick={() => setMenuOpen(false)}
                    className="label-luxe block py-4 text-ink/80"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="border-t border-ink/10 px-5 py-5">
              <a
                href={`tel:${brand.phone.replace(/\s/g, '')}`}
                className="block font-serif text-lg text-ink"
              >
                {brand.phone}
              </a>
              <p className="mt-1 text-xs text-ink/55">
                {brand.addressLine1}, {brand.addressLine2}
              </p>
            </div>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Navbar;