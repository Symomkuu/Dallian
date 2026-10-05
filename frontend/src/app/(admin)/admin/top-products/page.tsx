'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRightIcon,
  BoxesIcon,
  CheckCircleIcon,
  CoinsIcon,
  EyeIcon,
  FlameIcon,
  LayersIcon,
  PercentIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TrendingUpIcon,
} from 'lucide-react';
import {
  adminFetchTopProducts,
  TopProductItem,
  TopProductsAnalyticsResponse,
} from '@/utils/api';
import { cx, formatKsh } from '@/utils/format';

export default function AdminTopProductsPage() {
  const [data, setData] = useState<TopProductsAnalyticsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'viewed' | 'ordered' | 'comparison'>('viewed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');
    adminFetchTopProducts()
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setError('Failed to fetch top products analytics. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    adminFetchTopProducts()
      .then((res) => {
        if (active) {
          setData(res);
        }
      })
      .catch(() => {
        if (active) {
          setError('Failed to fetch top products analytics. Please try again.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const mostViewed = data?.most_viewed ?? [];
  const mostOrdered = data?.most_ordered ?? [];

  // Summary Metrics calculations
  const totalViews = mostViewed.reduce((sum, item) => sum + (item.views_count || 0), 0);
  const totalUnitsSold = mostOrdered.reduce((sum, item) => sum + (item.units_sold || 0), 0);
  const totalTopRevenue = mostOrdered.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
  const topViewedProduct = mostViewed[0] || null;
  const topOrderedProduct = mostOrdered[0] || null;

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="label-luxe text-[#8B3A2A]">Intelligence & Performance</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#8B3A2A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8B3A2A]">
              <SparklesIcon width={11} height={11} />
              Top 10 Rankings
            </span>
          </div>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
            Top Products Analytics
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Identify your most popular catalogue wigs by visitor interest and actual sales volume.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            aria-label="Refresh analytics data"
            className="flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-semibold text-ink/70 shadow-2xs transition hover:border-[#8B3A2A] hover:text-[#8B3A2A] disabled:opacity-40 cursor-pointer"
          >
            <RefreshCwIcon width={13} height={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 rounded-xl border border-[#8B3A2A]/20 bg-[#8B3A2A]/10 px-3.5 py-2 text-xs font-semibold text-[#8B3A2A] transition hover:bg-[#8B3A2A] hover:text-white shadow-2xs"
          >
            <BoxesIcon width={13} height={13} />
            <span>Catalogue Manager</span>
          </Link>
        </div>
      </div>

      {/* Error alert */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="font-semibold underline ml-2">Retry</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-ink/5 border border-ink/10" />
          ))
        ) : (
          <>
            {/* Total Views */}
            <div className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">
                  Top 10 Views
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8B3A2A]/20 bg-[#8B3A2A]/10 text-[#8B3A2A]">
                  <EyeIcon width={18} height={18} />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                  {totalViews.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-ink/45 font-medium">Accumulated storefront views</p>
              </div>
            </div>

            {/* Total Units Sold */}
            <div className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">
                  Top 10 Units Sold
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <ShoppingBagIcon width={18} height={18} />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                  {totalUnitsSold.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-ink/45 font-medium">Luxury wigs delivered & confirmed</p>
              </div>
            </div>

            {/* Top Revenue */}
            <div className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">
                  Top 10 Revenue
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-800">
                  <CoinsIcon width={18} height={18} />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                  {formatKsh(totalTopRevenue)}
                </p>
                <p className="mt-0.5 text-xs text-ink/45 font-medium">Generated by bestselling items</p>
              </div>
            </div>

            {/* Top Performer Highlights */}
            <div className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">
                  Top Highlights
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-700">
                  <FlameIcon width={18} height={18} />
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#8B3A2A]">#1 Most Viewed</p>
                  <p className="text-xs font-bold text-ink truncate">
                    {topViewedProduct ? `${topViewedProduct.name} (${(topViewedProduct.views_count ?? 0).toLocaleString()} views)` : 'No views yet'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-700">#1 Bestseller</p>
                  <p className="text-xs font-bold text-ink truncate">
                    {topOrderedProduct ? `${topOrderedProduct.name} (${topOrderedProduct.units_sold ?? 0} sold)` : 'No orders yet'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Card with Tabs */}
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        {/* Tab Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 bg-[#FAF7F2] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white text-xs font-bold">
              10
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">
                {activeTab === 'viewed' && 'Most Viewed Products (Top 10)'}
                {activeTab === 'ordered' && 'Most Ordered & Bestsellers (Top 10)'}
                {activeTab === 'comparison' && 'View-to-Order Conversion Matrix'}
              </h2>
              <p className="text-xs text-ink/50">
                {activeTab === 'viewed' && 'Ranked by customer views and product interest across the storefront.'}
                {activeTab === 'ordered' && 'Ranked by completed order units and generated sales revenue.'}
                {activeTab === 'comparison' && 'Side-by-side comparison of visitor views vs actual customer purchases.'}
              </p>
            </div>
          </div>

          <div className="flex items-center rounded-xl bg-ink/5 p-1 border border-ink/8 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('viewed')}
              className={cx(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
                activeTab === 'viewed'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink/60 hover:text-ink'
              )}
            >
              <EyeIcon width={13} height={13} className={activeTab === 'viewed' ? 'text-[#8B3A2A]' : ''} />
              <span>Most Viewed</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ordered')}
              className={cx(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
                activeTab === 'ordered'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink/60 hover:text-ink'
              )}
            >
              <ShoppingBagIcon width={13} height={13} className={activeTab === 'ordered' ? 'text-emerald-700' : ''} />
              <span>Most Ordered</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              className={cx(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
                activeTab === 'comparison'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink/60 hover:text-ink'
              )}
            >
              <LayersIcon width={13} height={13} className={activeTab === 'comparison' ? 'text-purple-700' : ''} />
              <span>Matrix</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-ink/5" />
            ))}
          </div>
        ) : (
          <>
            {/* View 1: Most Viewed */}
            {activeTab === 'viewed' && (
              <ProductRankingTable
                products={mostViewed}
                primaryMetric="views"
                emptyMessage="No product views recorded yet. As visitors view product pages, they will be listed here."
              />
            )}

            {/* View 2: Most Ordered */}
            {activeTab === 'ordered' && (
              <ProductRankingTable
                products={mostOrdered}
                primaryMetric="orders"
                emptyMessage="No orders have been placed yet. As customers checkout, bestselling items will rank here."
              />
            )}

            {/* View 3: Side-by-side Conversion Matrix */}
            {activeTab === 'comparison' && (
              <ConversionMatrixTable
                viewedList={mostViewed}
                orderedList={mostOrdered}
              />
            )}
          </>
        )}
      </div>

      {/* Strategic Merchandising Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8B3A2A]/10 text-[#8B3A2A]">
              <FlameIcon width={15} height={15} />
            </span>
            <h3 className="text-sm font-bold">High Interest, Low Conversion</h3>
          </div>
          <p className="mt-2 text-xs text-ink/60 leading-relaxed">
            If a wig has thousands of views in <strong>Most Viewed</strong> but does not appear in <strong>Most Ordered</strong>, consider reviewing its pricing, running a promotional offer, or enriching its customer reviews and gallery photos.
          </p>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUpIcon width={15} height={15} />
            </span>
            <h3 className="text-sm font-bold">Bestseller Inventory Management</h3>
          </div>
          <p className="mt-2 text-xs text-ink/60 leading-relaxed">
            Items in your <strong>Most Ordered</strong> list are your primary revenue drivers. Keep a close eye on their stock quantities to ensure key bestselling wigs never go out of stock.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProductRankingTable({
  products,
  primaryMetric,
  emptyMessage,
}: {
  products: TopProductItem[];
  primaryMetric: 'views' | 'orders';
  emptyMessage: string;
}) {
  if (products.length === 0) {
    return (
      <div className="p-12 text-center">
        <BoxesIcon width={36} height={36} className="mx-auto text-ink/20" />
        <p className="mt-3 text-sm font-semibold text-ink/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink/8 text-[11px] font-semibold uppercase tracking-wider text-ink/50 bg-[#FAF9F6]">
            <th className="px-5 py-3 sm:px-6 w-14 text-center">Rank</th>
            <th className="px-5 py-3 sm:px-6">Product Details</th>
            <th className="px-5 py-3 sm:px-6">Unit Price</th>
            <th className="px-5 py-3 sm:px-6 text-center">Store Views</th>
            <th className="px-5 py-3 sm:px-6 text-center">Units Sold</th>
            <th className="px-5 py-3 sm:px-6">Total Revenue</th>
            <th className="px-5 py-3 sm:px-6">Stock Status</th>
            <th className="px-5 py-3 sm:px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8">
          {products.map((product, index) => {
            const rank = index + 1;
            const rankBadge =
              rank === 1
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs ring-2 ring-amber-200/50'
                : rank === 2
                ? 'bg-slate-100 text-slate-800 border-slate-300 font-bold'
                : rank === 3
                ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                : 'bg-ink/5 text-ink/60 border-ink/10 font-semibold';

            return (
              <tr key={product.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                <td className="px-5 py-3.5 text-center sm:px-6">
                  <span
                    className={cx(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs',
                      rankBadge
                    )}
                  >
                    #{rank}
                  </span>
                </td>
                <td className="px-5 py-3.5 sm:px-6">
                  <div className="flex items-center gap-3">
                    {product.primary_image ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-ink/5">
                        <Image
                          src={product.primary_image}
                          alt={product.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink/10 bg-[#FAF7F2] text-ink/30">
                        <BoxesIcon width={20} height={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate max-w-[220px] sm:max-w-xs">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-ink/45">{product.category_name || 'Uncategorized'}</span>
                        {product.is_featured && (
                          <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800 uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-semibold text-ink sm:px-6 whitespace-nowrap">
                  <div>{formatKsh(product.price)}</div>
                  {product.previous_price && product.previous_price > product.price && (
                    <div className="text-[10px] text-ink/40 line-through">
                      {formatKsh(product.previous_price)}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center sm:px-6 whitespace-nowrap">
                  <span
                    className={cx(
                      'inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs',
                      primaryMetric === 'views'
                        ? 'bg-[#8B3A2A]/10 text-[#8B3A2A]'
                        : 'text-ink'
                    )}
                  >
                    <EyeIcon width={12} height={12} />
                    <span>{(product.views_count ?? 0).toLocaleString()}</span>
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center sm:px-6 whitespace-nowrap">
                  <span
                    className={cx(
                      'inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs',
                      primaryMetric === 'orders'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-ink'
                    )}
                  >
                    <ShoppingBagIcon width={12} height={12} />
                    <span>{product.units_sold ?? 0}</span>
                  </span>
                </td>
                <td className="px-5 py-3.5 font-semibold text-ink sm:px-6 whitespace-nowrap">
                  {product.total_revenue && product.total_revenue > 0 ? (
                    <span className="text-emerald-700 font-bold">{formatKsh(product.total_revenue)}</span>
                  ) : (
                    <span className="text-ink/35 text-xs">KSh 0</span>
                  )}
                </td>
                <td className="px-5 py-3.5 sm:px-6 whitespace-nowrap">
                  {product.is_in_stock ? (
                    <span
                      className={cx(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        product.stock_quantity > 5
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      )}
                    >
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'In stock'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                      Out of stock
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 sm:px-6 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <Link
                      href={`/shop/${product.slug}`}
                      target="_blank"
                      title="View on live storefront"
                      className="inline-flex items-center gap-1 rounded-lg border border-ink/15 bg-white px-2.5 py-1 text-xs font-medium text-ink transition hover:border-[#8B3A2A] hover:text-[#8B3A2A] shadow-2xs"
                    >
                      <span>View</span>
                      <ArrowUpRightIcon width={12} height={12} />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConversionMatrixTable({
  viewedList,
  orderedList,
}: {
  viewedList: TopProductItem[];
  orderedList: TopProductItem[];
}) {
  // Combine unique products from both lists
  const map = new Map<string | number, TopProductItem>();
  viewedList.forEach((p) => map.set(p.id, p));
  orderedList.forEach((p) => {
    const existing = map.get(p.id);
    if (existing) {
      map.set(p.id, { ...existing, ...p });
    } else {
      map.set(p.id, p);
    }
  });

  const allItems = Array.from(map.values());

  if (allItems.length === 0) {
    return (
      <div className="p-12 text-center">
        <BoxesIcon width={36} height={36} className="mx-auto text-ink/20" />
        <p className="mt-3 text-sm font-semibold text-ink/60">No analytics data available yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink/8 text-[11px] font-semibold uppercase tracking-wider text-ink/50 bg-[#FAF9F6]">
            <th className="px-5 py-3 sm:px-6">Product</th>
            <th className="px-5 py-3 sm:px-6 text-center">Views</th>
            <th className="px-5 py-3 sm:px-6 text-center">Units Sold</th>
            <th className="px-5 py-3 sm:px-6 text-center">Conversion Est.</th>
            <th className="px-5 py-3 sm:px-6">Total Sales</th>
            <th className="px-5 py-3 sm:px-6">Inventory Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8">
          {allItems.map((item) => {
            const views = item.views_count || 0;
            const units = item.units_sold || 0;
            const rate = views > 0 ? ((units / views) * 100).toFixed(1) : '0.0';

            return (
              <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                <td className="px-5 py-3.5 sm:px-6">
                  <div className="flex items-center gap-3">
                    {item.primary_image ? (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-ink/5">
                        <Image
                          src={item.primary_image}
                          alt={item.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink/10 bg-[#FAF7F2] text-ink/30">
                        <BoxesIcon width={18} height={18} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="text-[11px] text-ink/45">{item.category_name || 'Uncategorized'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center sm:px-6 font-mono text-xs text-ink font-semibold">
                  {views.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-center sm:px-6 font-mono text-xs text-ink font-semibold">
                  {units}
                </td>
                <td className="px-5 py-3.5 text-center sm:px-6">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200">
                    <PercentIcon width={11} height={11} />
                    <span>{rate}%</span>
                  </span>
                </td>
                <td className="px-5 py-3.5 sm:px-6 font-semibold text-emerald-700">
                  {item.total_revenue ? formatKsh(item.total_revenue) : 'KSh 0'}
                </td>
                <td className="px-5 py-3.5 sm:px-6">
                  {item.is_in_stock ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-medium">
                      <CheckCircleIcon width={13} height={13} className="text-emerald-600" />
                      <span>{item.stock_quantity > 0 ? `${item.stock_quantity} available` : 'In stock'}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">Out of stock</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
