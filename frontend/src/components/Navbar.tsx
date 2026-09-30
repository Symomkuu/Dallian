'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const emptySubscribe = () => () => {};

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Services', to: '/services' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar() {
  const { cartCount, wishlist, setCartOpen, user } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const pathname = usePathname();

  const isLinkActive = (to: string) => {
    if (to === '/') {
      return pathname === '/';
    }
    if (to === '/shop') {
      return pathname === '/shop' || pathname.startsWith('/product/') || pathname.startsWith('/category/');
    }
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Top Announcement Bar - Continuous Looping Marquee Moving Left to Right */}
      <div className="relative overflow-hidden bg-black py-2.5 text-white select-none border-b border-white/5">
        <div className="animate-marquee-right">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-6 text-[10px] tracking-[0.25em] uppercase text-white/90 sm:text-[11px]"
            >
              <span>{brand.announcement}</span>
              <span className="inline-block h-1 w-1 rounded-full bg-amber-400" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      <header
        className={cx(
          'sticky top-0 z-50 border-b bg-cream/95 backdrop-blur transition-[box-shadow,border-color] duration-300',
          scrolled ? 'border-ink/10 shadow-card' : 'border-transparent'
        )}
      >
        <div className="mx-auto flex max-w-page items-center justify-between gap-2 px-3.5 py-2.5 sm:px-8 sm:py-3.5 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 shrink min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="-ml-1 p-1.5 sm:p-2 text-ink lg:hidden shrink-0"
            >
              <MenuIcon width={20} height={20} />
            </button>

            <Logo className="shrink min-w-0" />
          </div>

          <nav aria-label="Main" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.to);
                return (
                  <li key={link.label}>
                    <Link
                      href={link.to}
                      className={cx(
                        'label-luxe relative inline-flex flex-col items-center py-2 transition-all duration-200',
                        isActive
                          ? 'text-[#8B3A2A] font-bold'
                          : 'text-ink/65 hover:text-ink'
                      )}
                    >
                      <span>{link.label}</span>
                      {isActive && (
                        <span className="absolute -bottom-1 inset-x-0 h-[2.5px] rounded-full bg-gradient-to-r from-[#D99B26] via-[#8B3A2A] to-[#D99B26] shadow-2xs" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1.5 lg:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="p-1.5 sm:p-2 text-ink transition-colors duration-200 hover:text-chestnut"
            >
              <SearchIcon width={20} height={20} className="sm:w-[21px] sm:h-[21px]" />
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
              className="relative p-1.5 sm:p-2 text-ink transition-colors duration-200 hover:text-chestnut"
            >
              <ShoppingBagIcon width={22} height={22} strokeWidth={2} className="sm:w-[25px] sm:h-[25px]" />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 sm:-right-1 flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] sm:text-[11px] font-bold text-ink shadow-sm ring-2 ring-cream">
                  {cartCount}
                </span>
              )}
            </button>
            {mounted && user ? (
              <Link
                href={user.role === 'staff' ? '/admin/dashboard' : '/customer/dashboard'}
                aria-label="Dashboard"
                className="flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/90 p-1.5 sm:px-3.5 sm:py-1.5 text-xs font-semibold tracking-wider uppercase text-ink shadow-2xs transition-all duration-200 hover:border-chestnut hover:bg-white hover:text-chestnut"
              >
                <LayoutDashboardIcon width={16} height={16} className="text-chestnut" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Sign in / Account"
                className="flex items-center justify-center p-1.5 sm:p-2 text-ink transition-colors duration-200 hover:text-chestnut"
              >
                <UserIcon width={20} height={20} className="sm:w-[22px] sm:h-[22px]" />
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
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="space-y-1.5">
                {navLinks.map((link) => {
                  const isActive = isLinkActive(link.to);
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.to}
                        onClick={() => setMenuOpen(false)}
                        className={cx(
                          'label-luxe flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-150',
                          isActive
                            ? 'bg-[#D99B26]/15 text-[#8B3A2A] font-bold border-l-4 border-[#D99B26] shadow-2xs'
                            : 'text-ink/80 hover:bg-ink/5 hover:text-chestnut'
                        )}
                      >
                        <span>{link.label}</span>
                        {isActive && (
                          <span className="h-2 w-2 rounded-full bg-[#D99B26] shadow-xs" />
                        )}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link
                    href="/track"
                    onClick={() => setMenuOpen(false)}
                    className={cx(
                      'label-luxe flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-150',
                      pathname === '/track'
                        ? 'bg-[#D99B26]/15 text-[#8B3A2A] font-bold border-l-4 border-[#D99B26] shadow-2xs'
                        : 'text-ink/80 hover:bg-ink/5 hover:text-chestnut'
                    )}
                  >
                    <span>Track Order</span>
                    {pathname === '/track' && (
                      <span className="h-2 w-2 rounded-full bg-[#D99B26] shadow-xs" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    href={mounted && user ? (user.role === 'staff' ? '/admin/dashboard' : '/customer/dashboard') : '/login'}
                    onClick={() => setMenuOpen(false)}
                    className={cx(
                      'label-luxe flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-150',
                      (pathname === '/login' || pathname.startsWith('/admin') || pathname.startsWith('/customer'))
                        ? 'bg-[#D99B26]/15 text-[#8B3A2A] font-bold border-l-4 border-[#D99B26] shadow-2xs'
                        : 'text-ink/80 hover:bg-ink/5 hover:text-chestnut'
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      {mounted && user ? (
                        <LayoutDashboardIcon width={16} height={16} className="text-chestnut" />
                      ) : (
                        <UserIcon width={16} height={16} />
                      )}
                      <span>{mounted && user ? 'Dashboard' : 'Sign In / Account'}</span>
                    </span>
                    {mounted && user ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        {user.role === 'staff' ? 'Admin' : 'Member'}
                      </span>
                    ) : (
                      pathname === '/login' && (
                        <span className="h-2 w-2 rounded-full bg-[#D99B26] shadow-xs" />
                      )
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    onClick={() => setMenuOpen(false)}
                    className={cx(
                      'label-luxe flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-150',
                      pathname === '/faq'
                        ? 'bg-[#D99B26]/15 text-[#8B3A2A] font-bold border-l-4 border-[#D99B26] shadow-2xs'
                        : 'text-ink/80 hover:bg-ink/5 hover:text-chestnut'
                    )}
                  >
                    <span>FAQ</span>
                    {pathname === '/faq' && (
                      <span className="h-2 w-2 rounded-full bg-[#D99B26] shadow-xs" />
                    )}
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