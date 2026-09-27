'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { EyeIcon, EyeOffIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { cx, formatKsh } from '@/utils/format';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';
import {
  fetchDashboardProducts,
  updateDashboardProduct,
  deleteDashboardProduct,
  type DashboardProduct,
} from '@/utils/api';

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
  const { pushToast } = useStore();
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive' | 'in-stock' | 'low-stock' | 'out-of-stock'
  >('all');
  const [productToDelete, setProductToDelete] = useState<DashboardProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (product: DashboardProduct) => {
    setTogglingId(product.id);
    const nextActive = !product.is_active;
    try {
      await updateDashboardProduct(product.id, { is_active: nextActive });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: nextActive } : p))
      );
      toast.success(nextActive ? 'Product published' : 'Product deactivated', {
        description: `${product.name} is now ${nextActive ? 'visible in the store' : 'hidden from customers'}.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update product status.';
      toast.error('Failed to update status', {
        description: message,
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeactivateInstead = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await updateDashboardProduct(productToDelete.id, { is_active: false });
      setProducts((prev) =>
        prev.map((p) => (p.id === productToDelete.id ? { ...p, is_active: false } : p))
      );
      toast.success('Product deactivated', {
        description: `${productToDelete.name} has been set to inactive and hidden from the boutique.`,
      });
      setProductToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not deactivate product.';
      toast.error('Failed to deactivate product', {
        description: message,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteDashboardProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success('Product deleted', {
        description: `${productToDelete.name} was removed from the catalogue.`,
      });
      setProductToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not delete product.';
      toast.error('Failed to delete product', {
        description: message,
      });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
      const status = stockStatus(p);
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = Boolean(p.is_active);
      else if (statusFilter === 'inactive') matchesStatus = !p.is_active;
      else if (statusFilter !== 'all') matchesStatus = status === statusFilter;
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
          <option value="all">All Products</option>
          <option value="active">Active (Visible)</option>
          <option value="inactive">Inactive (Hidden)</option>
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
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {!product.is_active && (
                      <span className="bg-amber-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                        Inactive
                      </span>
                    )}
                    {product.is_featured && (
                      <span className="bg-black px-2 py-0.5 text-[10px] tracking-wider text-white uppercase shadow-xs">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleActive(product);
                      }}
                      disabled={togglingId === product.id}
                      aria-label={product.is_active ? `Hide ${product.name}` : `Show ${product.name}`}
                      title={
                        product.is_active
                          ? 'Click to make inactive (hide from store)'
                          : 'Click to activate (show in store)'
                      }
                      className={cx(
                        'flex h-7 w-7 items-center justify-center bg-white/95 shadow-sm transition-colors hover:bg-white',
                        product.is_active
                          ? 'text-emerald-700 hover:text-emerald-900'
                          : 'text-amber-600 hover:text-amber-800'
                      )}
                    >
                      {product.is_active ? (
                        <EyeIcon width={13} height={13} />
                      ) : (
                        <EyeOffIcon width={13} height={13} />
                      )}
                    </button>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      aria-label={`Edit ${product.name}`}
                      className="flex h-7 w-7 items-center justify-center bg-white/95 text-ink shadow-sm transition-colors hover:bg-white hover:text-chestnut"
                    >
                      <PencilIcon width={13} height={13} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(product)}
                      aria-label={`Delete ${product.name}`}
                      className="flex h-7 w-7 items-center justify-center bg-white/95 text-red-600 shadow-sm transition-colors hover:bg-white hover:text-red-700"
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
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={cx(
                        'text-[10px] font-semibold tracking-wider uppercase',
                        product.is_active ? 'text-emerald-700' : 'text-amber-700'
                      )}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2Icon width={22} height={22} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">Delete Product</h3>
                <p className="mt-1 text-xs text-ink/70 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <strong className="text-ink font-semibold">{productToDelete.name}</strong>? This
                  will permanently remove the piece, its variants, and media from the boutique.
                </p>
              </div>
            </div>

            {/* Product Mini Preview */}
            <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-cream/30 p-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                {productToDelete.images?.[0]?.image_url ? (
                  <img
                    src={productToDelete.images[0].image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-ink/30">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">{productToDelete.name}</p>
                <p className="text-xs font-bold text-chestnut">
                  {formatKsh(Number(productToDelete.price))}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeactivateInstead}
                className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                Deactivate Instead (Keep Data)
              </button>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setProductToDelete(null)}
                  className="rounded-xl border border-ink/15 px-3.5 py-2.5 text-xs font-semibold text-ink hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
