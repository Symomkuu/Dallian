'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

/**
 * Wraps every page with the storefront chrome (nav, footer, cart drawer) —
 * except admin/customer dashboard routes, which render their own
 * sidebar/header instead.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasOwnChrome = pathname?.startsWith('/admin') || pathname?.startsWith('/customer');

  if (hasOwnChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
