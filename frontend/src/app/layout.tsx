import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Providers } from '@/components/Provider';
import { SiteChrome } from '@/components/SiteChrome';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

export const metadata: Metadata = {
  title: 'Dallian Luxe Hair E-Commerce Platform',
  description:
    'Premium luxury human hair wigs, weaves, and extensions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <Providers>
          <Suspense fallback={null}>
            <SiteChrome>{children}</SiteChrome>
            <FloatingWhatsApp />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}