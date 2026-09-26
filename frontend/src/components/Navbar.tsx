'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  HeartIcon,
  LayoutDashboardIcon,
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
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = `${pathname}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ''
  }`;

  useEffect(() => {
    setMounted(true);
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
              className="p-2 text-ink transition-colors duration-200 hover:text-chestnut"
            >
              <SearchIcon width={21} height={21} />
            </button>
            <Link
              href="/wishlist"
              aria-label={mounted && wishlist.length > 0 ? `Wishlist, ${wishlist.length} items` : 'Wishlist'}
              suppressHydrationWarning
              className="relative hidden p-2 text-ink transition-colors duration-200 hover:text-chestnut sm:block"
            >
              <HeartIcon width={23} height={23} />
              {mounted && wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-chestnut px-1 text-[11px] font-bold text-cream shadow-xs ring-2 ring-cream">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={mounted && cartCount > 0 ? `Shopping bag, ${cartCount} items` : 'Shopping bag'}
              suppressHydrationWarning
              className="relative p-2 text-ink transition-colors duration-200 hover:text-chestnut"
            >
              <ShoppingBagIcon width={25} height={25} strokeWidth={2} />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-ink shadow-sm ring-2 ring-cream">
                  {cartCount}
                </span>
              )}
            </button>
            {mounted && user ? (
              <Link
                href={user.role === 'staff' ? '/admin/dashboard' : '/customer/dashboard'}
                aria-label="Dashboard"
                className="hidden items-center gap-1.5 rounded-full border border-ink/20 bg-white/90 px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-ink shadow-2xs transition-all duration-200 hover:border-chestnut hover:bg-white hover:text-chestnut sm:flex"
              >
                <LayoutDashboardIcon width={14} height={14} className="text-chestnut" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Sign in"
                className="hidden p-2.5 text-ink transition-colors duration-200 hover:text-chestnut sm:block"
              >
                <UserIcon width={18} height={18} />
              </Link>
            )}
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
                    href={mounted && user ? (user.role === 'staff' ? '/admin/dashboard' : '/customer/dashboard') : '/login'}
                    onClick={() => setMenuOpen(false)}
                    className="label-luxe flex items-center justify-between py-4 text-ink/80 transition-colors duration-150 hover:text-chestnut"
                  >
                    <span className="flex items-center gap-2.5">
                      {mounted && user ? (
                        <LayoutDashboardIcon width={16} height={16} className="text-chestnut" />
                      ) : (
                        <UserIcon width={16} height={16} />
                      )}
                      <span>{mounted && user ? 'Dashboard' : 'Sign In / Account'}</span>
                    </span>
                    {mounted && user && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        {user.role === 'staff' ? 'Admin' : 'Member'}
                      </span>
                    )}
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