import React, { useEffect } from 'react';
import { Outlet, useLocation } from '@/components/RouterCompat';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MobileTabBar } from './MobileTabBar';
import { ToastStack } from './ui/ToastStack';

export function SiteLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <Navbar />
      <main id="main" className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <CartDrawer />
      <ToastStack />
    </div>);

}