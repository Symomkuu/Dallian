import React from 'react';
import Link from 'next/link';
import { ShoppingBagIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] w-full items-center justify-center bg-[#FAF7F2] px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-xl text-center space-y-8">

        {/* Large Decorative 404 Number */}
        <div className="relative select-none">
          <span className="font-serif text-8xl font-bold tracking-tight text-ink/10 sm:text-9xl">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-5xl font-bold italic tracking-wider text-[#8B3A2A] sm:text-6xl drop-shadow-xs">
              404
            </span>
          </div>
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-3">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink leading-tight">
            The Page You Seek Has Moved
          </h1>
          <p className="text-sm sm:text-base text-ink/65 leading-relaxed max-w-md mx-auto">
            The link you followed may be outdated, mistyped, or the page has stepped out of our collection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-[#8B3A2A] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-cream shadow-sm transition hover:opacity-90 active:scale-98"
          >
            <ShoppingBagIcon width={15} height={15} />
            <span>Go to Shop</span>
          </Link>

          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-xl border border-ink/20 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink shadow-2xs transition hover:border-[#8B3A2A] hover:text-[#8B3A2A] active:scale-98"
          >
            <span>Contact Support</span>
          </Link>
        </div>

        {/* Quick Suggestions */}
        <div className="border-t border-ink/10 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/40 mb-3">
            Popular Destinations
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-ink/70">
            <Link href="/" className="hover:text-[#8B3A2A] transition-colors">
              Wigs Catalogue
            </Link>
            <span className="text-ink/25">•</span>
            <Link href="/track" className="hover:text-[#8B3A2A] transition-colors">
              Track Order
            </Link>
            <span className="text-ink/25">•</span>
            <Link href="/contact" className="hover:text-[#8B3A2A] transition-colors">
              Contact Concierge
            </Link>
            <span className="text-ink/25">•</span>
            <Link href="/about" className="hover:text-[#8B3A2A] transition-colors">
              About Dallian
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
