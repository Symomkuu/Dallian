'use client';

import React, { useState } from 'react';
import type { Product } from '../types';
import { cx } from '../utils/format';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';

interface ProductGridProps {
  products: Product[];
  columns?: 3 | 4;
  loading?: boolean;
}

export function ProductGrid({ products, columns = 4, loading }: ProductGridProps) {
  const [quickView, setQuickView] = useState<Product | null>(null);

  if (loading) {
    return (
      <div
        className={cx(
          'grid grid-cols-2 gap-3 sm:gap-5',
          columns === 4 ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-3'
        )}>
        
        {Array.from({ length: columns === 4 ? 8 : 6 }).map((_, index) =>
        <div key={index} className="border border-ink/10 bg-white p-0">
            <div className="skeleton aspect-[4/5] w-full" />
            <div className="space-y-3 p-5">
              <div className="skeleton h-2.5 w-20" />
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-2.5 w-28" />
              <div className="skeleton h-9 w-full" />
            </div>
          </div>
        )}
      </div>);

  }

  return (
    <>
      <div
        className={cx(
          'grid grid-cols-2 gap-3 sm:gap-5',
          columns === 4 ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-3'
        )}>
        
        {products.map((product) =>
        <ProductCard key={product.id} product={product} onQuickView={setQuickView} />
        )}
      </div>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>);

}