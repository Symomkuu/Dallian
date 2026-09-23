'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { formatKsh } from '@/utils/format';
import { fetchDashboardProducts, type DashboardProduct } from '@/utils/api';

const statusTone: Record<string, string> = {
  'in-stock': 'bg-emerald-50 text-emerald-800',
  'low-stock': 'bg-[#D99B26]/15 text-[#8a6111]',
  'out-of-stock': 'bg-red-50 text-red-700',
};

function stockStatus(p: DashboardProduct): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (p.stock_quantity === 0) return 'out-of-stock';
  if (p.stock_quantity <= 5) return 'low-stock';
  return 'in-stock';
}

function stockLabel(status: ReturnType<typeof stockStatus>) {
  if (status === 'in-stock') return 'In Stock';
  if (status === 'low-stock') return 'Low Stock';
  return 'Out of Stock';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  >('all');

  useEffect(() => {
    fetchDashboardProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
      const status = stockStatus(p);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-luxe text-chestnut">Products</p>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
            Manage your product catalogue
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-black px-5 py-2.5 text-xs tracking-widest text-white uppercase transition-colors duration-200 hover:bg-neutral-800"
        >
          <PlusIcon width={15} height={15} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            width={16}
            height={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/40"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full border border-ink/15 bg-white py-2.5 pr-3 pl-9 text-sm text-ink placeholder:text-ink/40 focus:border-chestnut focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          className="border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-chestnut focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse border border-ink/10 bg-white">
              <div className="aspect-square bg-cream" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-3/4 rounded bg-ink/10" />
                <div className="h-3 w-1/2 rounded bg-ink/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product) => {
            const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];
            const status = stockStatus(product);
            return (
              <div
                key={product.id}
                className="group relative border border-ink/10 bg-white"
              >
                <div className="relative aspect-square overflow-hidden bg-cream">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink/20 text-xs">
                      No image
                    </div>
                  )}
                  {product.is_featured && (
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
                    {product.previous_price && (
                      <span className="text-xs text-ink/40 line-through">
                        {formatKsh(Number(product.previous_price))}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-chestnut">
                      {formatKsh(Number(product.price))}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-end">
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${statusTone[status]}`}
                    >
                      {stockLabel(status)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty states */}
      {!loading && products.length === 0 && (
        <div className="border border-dashed border-ink/15 py-16 text-center">
          <p className="text-sm text-ink/50">No products yet.</p>
          <Link
            href="/admin/products/new"
            className="mt-3 inline-flex items-center gap-2 text-xs text-chestnut underline underline-offset-4"
          >
            <PlusIcon width={13} height={13} />
            Add your first product
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && filtered.length === 0 && (
        <p className="border border-dashed border-ink/15 py-12 text-center text-sm text-ink/50">
          No products match your filters.
        </p>
      )}
    </div>
  );
}
