'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { products } from '@/data/products';
import type { Category } from '@/types';
import { availabilityLabel, formatKsh } from '@/utils/format';

const categoryLabels: Record<Category, string> = {
  'human-hair': 'Human Hair',
  futura: 'Japanese Futura',
};

const statusTone: Record<string, string> = {
  'in-stock': 'bg-emerald-50 text-emerald-800',
  'low-stock': 'bg-[#D99B26]/15 text-[#8a6111]',
  'out-of-stock': 'bg-red-50 text-red-700',
};

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | Category>('all');
  const [status, setStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = category === 'all' || product.category === category;
      const matchesStatus = status === 'all' || product.availability === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-luxe text-chestnut">Products</p>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">Manage your product catalog</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-black px-5 py-2.5 text-xs tracking-widest text-white uppercase transition-colors duration-200 hover:bg-neutral-800"
        >
          <PlusIcon width={15} height={15} />
          Add Product
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon width={16} height={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products…"
            className="w-full border border-ink/15 bg-white py-2.5 pr-3 pl-9 text-sm text-ink placeholder:text-ink/40 focus:border-chestnut focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as 'all' | Category)}
          className="border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-chestnut focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="human-hair">Human Hair</option>
          <option value="futura">Japanese Futura</option>
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-chestnut focus:outline-none"
        >
          <option value="all">Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((product) => (
          <div key={product.id} className="group relative border border-ink/10 bg-white">
            <div className="relative aspect-square overflow-hidden bg-cream">
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              {product.badges.includes('featured') && (
                <span className="absolute top-2 left-2 bg-black px-2 py-1 text-[10px] tracking-wider text-white uppercase">
                  Featured
                </span>
              )}
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  aria-label={`Edit ${product.name}`}
                  className="flex h-7 w-7 items-center justify-center bg-white/95 text-ink shadow-sm hover:bg-white"
                >
                  <PencilIcon width={13} height={13} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${product.name}`}
                  className="flex h-7 w-7 items-center justify-center bg-white/95 text-red-600 shadow-sm hover:bg-white"
                >
                  <Trash2Icon width={13} height={13} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-medium text-ink">{product.name}</p>
              <div className="mt-1.5 flex items-baseline gap-2">
                {product.compareAtPrice && (
                  <span className="text-xs text-ink/40 line-through">{formatKsh(product.compareAtPrice)}</span>
                )}
                <span className="text-sm font-semibold text-chestnut">{formatKsh(product.price)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate text-[11px] text-ink/50">{categoryLabels[product.category]}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${statusTone[product.availability]}`}>
                  {availabilityLabel(product.availability)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="border border-dashed border-ink/15 py-12 text-center text-sm text-ink/50">
          No products match your filters.
        </p>
      )}
    </div>
  );
}
