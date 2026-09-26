'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftIcon, KeyRoundIcon, LayoutDashboardIcon, LogOutIcon, MenuIcon, PackageIcon, SettingsIcon, ShoppingBagIcon, XIcon } from 'lucide-react';
import { brand } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { cx } from '@/utils/format';
import { ResetPasswordModal } from '@/components/ResetPasswordModal';

const navItems = [
  { label: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboardIcon },
  { label: 'My Orders', href: '/customer/orders', icon: PackageIcon },
  { label: 'Settings', href: '/customer/settings', icon: SettingsIcon },
];

/**
 * Gate for every /customer/* route: only signed-in customers may pass. Staff
 * and signed-out visitors are redirected before any dashboard content renders.
 */
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, authReady, signOut, pushToast, cart } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'customer') {
      router.replace('/admin/dashboard');
    }
  }, [authReady, user, router]);

  // While hydrating or waiting for auth, render the same outer shell so the
  // server-rendered HTML and client HTML always match (prevents hydration errors).
  const isReady = authReady && !!user && user.role === 'customer';

  const handleLogout = async () => {
    await signOut();
    pushToast({ title: 'Signed out.', tone: 'info' });
    router.push('/login');
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <Image src={brand.logo} alt="" width={36} height={36} className="rounded-full border border-[#D99B26]/40 object-cover" />
        <div className="leading-none">
          <p className="font-serif text-sm tracking-[0.12em]">DALLIAN</p>
          <p className="mt-1 text-[9px] tracking-[0.3em] text-[#D99B26]">MY ACCOUNT</p>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close account menu"
          className="ml-auto p-1 text-white/60 lg:hidden"
        >
          <XIcon width={18} height={18} />
        </button>
      </div>

      <nav aria-label="Account" className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cx(
                    'flex items-center gap-3 rounded-sm px-2.5 py-2.5 text-sm transition-colors duration-200',
                    active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <item.icon width={16} height={16} className="shrink-0 text-[#D99B26]/80" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-sm px-2.5 py-2.5 text-sm text-white/60 transition-colors duration-200 hover:bg-white/5 hover:text-white"
        >
          Continue Shopping
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-sm px-2.5 py-2.5 text-sm text-white/60 transition-colors duration-200 hover:bg-white/5 hover:text-white"
        >
          <LogOutIcon width={16} height={16} className="shrink-0 text-[#D99B26]/80" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-cream">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">{isReady ? sidebar : <div className="h-full bg-black" />}</div>
      </aside>

      {isReady && menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/60"
          />
          <div className="relative h-full w-72">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-ink/10 bg-cream/95 px-5 py-3.5 backdrop-blur sm:gap-4 sm:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open account menu"
            className={cx('-ml-1 p-2 text-ink lg:hidden', !isReady && 'invisible')}
          >
            <MenuIcon width={20} height={20} />
          </button>
          <p className="label-luxe text-ink/50">My Account</p>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-3.5">
            {/* Continue Shopping button */}
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full border border-[#8B3A2A]/30 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-2xs transition hover:border-[#8B3A2A] hover:bg-[#8B3A2A] hover:text-white"
            >
              <ArrowLeftIcon width={13} height={13} />
              <span className="hidden xs:inline sm:inline">Continue Shopping</span>
              <span className="xs:hidden sm:hidden">Shop</span>
            </Link>

            {/* Cart — bigger icon for visibility */}
            <Link
              href="/cart"
              aria-label={`Cart (${cart.length} items)`}
              className="relative rounded-full p-2 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <ShoppingBagIcon width={26} height={26} />
              {cart.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-chestnut-deep text-[10px] font-bold leading-none text-cream shadow">
                  {cart.length > 9 ? '9+' : cart.length}
                </span>
              )}
            </Link>

            {/* Avatar + dropdown */}
            {isReady && (
              <div ref={avatarRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAvatarOpen((v) => !v)}
                  aria-label="Account menu"
                  className="flex items-center gap-2.5 rounded-full focus:outline-none"
                >
                  <span className="hidden text-sm text-ink/60 sm:block">{user!.full_name}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-chestnut-deep text-sm font-semibold text-cream shadow-sm ring-2 ring-transparent transition hover:ring-chestnut-deep/30">
                    {user!.full_name
                      ?.split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'CU'}
                  </span>
                </button>

                {/* dropdown */}
                {avatarOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-lg">
                    {/* user info */}
                    <div className="border-b border-ink/8 px-4 py-3">
                      <p className="text-sm font-semibold text-ink leading-tight">{user!.full_name}</p>
                      <p className="mt-0.5 text-[11px] text-ink/45 truncate">{user!.email}</p>
                    </div>
                    {/* actions */}
                    <div className="py-1">
                      <Link
                        href="/customer/settings"
                        onClick={() => setAvatarOpen(false)}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-ink/75 transition hover:bg-ink/5 hover:text-ink"
                      >
                        <SettingsIcon width={15} height={15} />
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarOpen(false);
                          setResetModalOpen(true);
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-ink/75 transition hover:bg-ink/5 hover:text-ink cursor-pointer"
                      >
                        <KeyRoundIcon width={15} height={15} />
                        Reset Password
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAvatarOpen(false); handleLogout(); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 cursor-pointer"
                      >
                        <LogOutIcon width={15} height={15} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8">
          {isReady ? children : (
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-sm text-ink/50">Checking your access…</p>
            </div>
          )}
        </main>
      </div>

      {user?.email && (
        <ResetPasswordModal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          email={user.email}
        />
      )}
    </div>
  );
}
