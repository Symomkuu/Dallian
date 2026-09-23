'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboardIcon, LogOutIcon, MenuIcon, XIcon, BoxesIcon } from 'lucide-react';
import { brand } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { cx } from '@/utils/format';

// Only "Dashboard" and "Products" exist today — Orders and the rest will be
// added as their own sections later, without needing to touch this layout again.
const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboardIcon },
  { label: 'Products', href: '/admin/products', icon: BoxesIcon },
];

/**
 * Gate for every /admin/* route: only signed-in staff may pass. Customers
 * and signed-out visitors are redirected before any dashboard content renders.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, authReady, signOut, pushToast } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'staff') {
      router.replace('/account');
    }
  }, [authReady, user, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!authReady || !user || user.role !== 'staff') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink/60">Checking your access…</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    pushToast({ title: 'Signed out.', tone: 'info' });
    router.push('/login');
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <img src={brand.logo} alt="" className="h-9 w-9 rounded-full border border-[#D99B26]/40 object-cover" />
        <div className="leading-none">
          <p className="font-serif text-sm tracking-[0.12em]">DALLIAN</p>
          <p className="mt-1 text-[9px] tracking-[0.3em] text-[#D99B26]">ADMIN</p>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close admin menu"
          className="ml-auto p-1 text-white/60 lg:hidden"
        >
          <XIcon width={18} height={18} />
        </button>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-5">
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
        <div className="fixed inset-y-0 left-0 w-64">{sidebar}</div>
      </aside>

      {menuOpen && (
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
        <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-ink/10 bg-cream/95 px-5 py-3.5 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open admin menu"
            className="-ml-1 p-2 text-ink lg:hidden"
          >
            <MenuIcon width={20} height={20} />
          </button>
          <p className="label-luxe text-ink/50">Store Administration</p>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-ink/55 sm:block">{user.full_name}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-chestnut-deep text-xs font-medium text-cream">
              {user.full_name
                ?.split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'ST'}
            </span>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
